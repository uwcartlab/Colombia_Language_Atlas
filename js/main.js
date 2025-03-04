//project javascript information
(function(){
    //////////////function that allows topojson layers to be loaded///////////////////////
	L.TopoJSON = L.GeoJSON.extend({  
        addData: function(jsonData) {    
          if (jsonData.type === 'Topology') {
                for (key in jsonData.objects) {
                  geojson = topojson.feature(jsonData, jsonData.objects[key]);
                  L.GeoJSON.prototype.addData.call(this, geojson);
            }
      }    
      else {
            L.GeoJSON.prototype.addData.call(this, jsonData);
          }
        }  
    });
    //active department
    let department,department_participants;
    //create map
    var map = L.map('map',{
        minZoom:6,
        maxZoom:8,
        maxBounds:[
            [-4.23,-80.09],
            [13.57,-66.87]
        ]
    }).setView([4.11, -73.76], 6);
    //create tileset
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    })//.addTo(map);
    getColumbiaData();

    function addBackgroundData(){
        let PAINT_RULES = [
            {
                dataLayer:"background",
                symbolizer:new protomapsL.PolygonSymbolizer({
                    fill:"#d9d9d9",
                    stroke:"#b3b3b3",
                    opacity:1,
                    width:1
                })
            }
        ]
        let LABEL_RULES = [
            {
                dataLayer:"country_labels",
                symbolizer: new protomapsL.CenteredTextSymbolizer({
                        labelProps:["name"],
                        font: "12px roboto",
                        fill:"#000000",
                        stroke:"#ffffff",
                        width:1,
                        lineHeight:1.5
                    })
            },
            {
                dataLayer:"colombia_labels",
                symbolizer: new protomapsL.CenteredTextSymbolizer({
                        labelProps:["name"],
                        font: "bold 12px roboto",
                        fill:"#000000",
                        stroke:"#ffffff",
                        width:1,
                        lineHeight:1.5
                    })
            }
        ];
    
        let url = "data/merged.pmtiles";
            
        let layers = protomapsL.leafletLayer({
                url: url,
                paintRules:PAINT_RULES,
                labelRules:LABEL_RULES,
                pane:'overlayPane'
            });
            
        layers.addTo(map)
    }
    //fetch colombia data
    function getColumbiaData(){
        fetch("data/colombia_departments.json")
        .then(res => res.json())
        .then(data => {
            //filter selection
            //gender, age, setting, occupation
            let filters= ["all", "all", "all", "all"];
            //load language CSV
            fetch("data/colombia_language_data.csv")
                .then(res => res.text())
                .then(csv => {
                //parse csv
                csv = Papa.parse(csv,{
                    header:true
                }).data;
                //create filter arrays
                let occupations = [], genders = [], ages = [], settings = [];
                //create colombia geojson
                let colombia = new L.TopoJSON(data,{
                    onEachFeature:function(feature,layer){
                        layer.on("click",function(e){
                            //set selected department as active
                            department = feature.properties.name
                            department_participants = feature.properties["participants"];
                            createParticipantList();
                        })
                    },
                    style:function(feature){
                        let participants = [];

                        csv.forEach(function(c){
                            if (feature.properties.name == c.Departments){
                                if (!genders.includes(c.Sex))
                                    genders.push(c.Sex)
                                if (!ages.includes(c.Age))
                                    ages.push(c.Age)
                                if (!settings.includes(c["Setting (rural vs urban)"]))
                                    settings.push(c["Setting (rural vs urban)"])
                                if (!occupations.includes(c.Occupation))
                                    occupations.push(c.Occupation)
                                
                                participants.push(c)
                            }
                        })
                        feature.properties["participants"] = participants;
                        
                        let fillOpacity = participants.length > 0 ? 0.7:0.3; 

                        return {
                            fillColor:"#2d8659",
                            fillOpacity:fillOpacity,
                            color:"white",
                            weight:1,
                            pane:"tilePane"
                        }
                    }
                }).addTo(map);
                addBackgroundData();
                //create gender list
                genders.forEach(function(elem){
                    let item =  "<option value='" + elem + "' label='" + elem + "'>" + elem + "</option>";
                    document.querySelector("#gender").insertAdjacentHTML("beforeend",item)
                })
                //create age list
                ages.forEach(function(elem){
                    let item =  "<option value='" + elem + "' label='" + elem.charAt(0).toUpperCase() + elem.slice(1) + "'></option>";
                    document.querySelector("#age").insertAdjacentHTML("beforeend",item)
                })
                //create settings list
                settings.forEach(function(elem){
                    let item =  "<option value='" + elem + "' label='" + elem.charAt(0).toUpperCase() + elem.slice(1) + "'></option>";
                    document.querySelector("#setting").insertAdjacentHTML("beforeend",item)
                })
                //create occupation list
                occupations.forEach(function(elem){
                    let item =  "<option value='" + elem + "' label='" + elem.charAt(0).toUpperCase() + elem.slice(1) + "'></option>";
                    document.querySelector("#occupation").insertAdjacentHTML("beforeend",item)
                })
                //create participant list
                function createParticipantList(){
                    document.querySelector("#list").innerHTML = "";
                    let html = "<h1>" + department + "</h1>", current_participants = 0;
                    if (department_participants){
                        department_participants.forEach(function(b){
                        
                            if((filters[0] == b["Sex"] || filters[0] == 'all')&&
                                (filters[1] == b["Age"] || filters[1] == 'all')&&
                                (filters[2] == b["Setting (rural vs urban)"] || filters[2] == 'all')&&
                                (filters[3] == b["Occupation"] || filters[3] == 'all')){
    
                                current_participants++;
                                if (b["Participation ID"])
                                    html += "<div class='participant'><p>" + b["Participation ID"] + "</p>";
    
                                html += "<p>" + b["City"] + "</p>";
                                html += "<p>Age: " + b["Age"] + "</p>";
                                html += "<p>Gender: " + b["Sex"] + "</p>";
                                html += "<p>Occupation: " + b["Occupation"] + "</p>";
                                html += "<p>Setting: " + b["Setting (rural vs urban)"] + "</p></div>";
                            }
                        })
                    }    
                    if (current_participants == 0)
                        html += "<p>No participants found.</p>" 
                    
                    document.querySelector("#list").insertAdjacentHTML("beforeend",html);
                }
                //create filters 
                document.querySelectorAll(".dropdown").forEach(function(elem,i){
                    elem.addEventListener("change",function(e){                        
                        filters[i] = e.target.value;
                        if (department)
                            createParticipantList();  
                        
                        colombia.setStyle(resetStyle)
                    })
                })
                //reset button
                document.querySelector("#reset").addEventListener("click",function(elem){
                    document.querySelector("#list").innerHTML = "";
                    department = "";
                    document.querySelectorAll(".dropdown").forEach(function(elem,i){
                        elem.value = "all";
                        filters = ["all", "all", "all", "all"];
                    })
                    colombia.setStyle(resetStyle)
                })
                //reset style
                function resetStyle(feature){
                    let currentFilter = false;

                    feature.properties.participants.forEach(function(b){
                        if((filters[0] == b["Sex"] || filters[0] == 'all')&&
                        (filters[1] == b["Age"] || filters[1] == 'all')&&
                        (filters[2] == b["Setting (rural vs urban)"] || filters[2] == 'all')&&
                        (filters[3] == b["Occupation"] || filters[3] == 'all')){
                            currentFilter = true;
                        }
                    })

                    let fillOpacity = currentFilter ? 0.7: 0.3;
                    let interaction = currentFilter ? true: false;

                    return {
                        fillColor:"#2d8659",
                        fillOpacity:fillOpacity,
                        color:"white",
                        weight:1,
                        interaction:interaction
                    }
                }
            })
        })
    }
})();
