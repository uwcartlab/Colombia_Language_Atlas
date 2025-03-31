//project javascript information
//To do
//Create filter menu interface for mobile
//Add full list initially
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
    let total_participants = [],department,department_participants,filter = false;
    //create map
    var map = L.map('map',{
        minZoom:4,
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
    //style basemap data
    function addBackgroundData(){
        //background country data
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
        //labels
        let LABEL_RULES = [
        //country labels
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
        //colombian department labels
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
        //url for background data files
        let url = "data/background_data.pmtiles";
        //protomaps layers    
        let layers = protomapsL.leafletLayer({
                url: url,
                paintRules:PAINT_RULES,
                labelRules:LABEL_RULES,
                pane:'overlayPane'
            });
        //add layers to map
        layers.addTo(map)
    }
    //fetch colombia data
    function getColumbiaData(){
        fetch("data/colombia_departments.json")
        .then(res => res.json())
        .then(data => {
            //filter selection
            //gender, age, setting, occupation
            let filters= ["all", "all", "all", "all","all"];
            //load language CSV
            fetch("data/colombia_language_data.csv")
                .then(res => res.text())
                .then(csv => {
                //parse csv
                csv = Papa.parse(csv,{
                    header:true
                }).data;
                //create filter arrays
                let occupations = [], genders = [], ages = [], settings = [], departments = [];
                //create colombia geojson
                let colombia = new L.TopoJSON(data,{
                    style:function(feature){
                        let participants = [];
                        //add departments to list
                        if (!departments.includes(feature.properties.name))
                            departments.push(feature.properties.name)
                        //style runs before oneachfeature, so we use the style function to populate the filter arrays
                        csv.forEach(function(c){
                            if (feature.properties.name == c.Departments){
                                //gender array
                                if (!genders.includes(c.Sex))
                                    genders.push(c.Sex)
                                //age array
                                if (!ages.includes(c.Age))
                                    ages.push(c.Age)
                                //setting array
                                if (!settings.includes(c["Setting (rural vs urban)"]))
                                    settings.push(c["Setting (rural vs urban)"])
                                //occupation array
                                if (!occupations.includes(c.Occupation))
                                    occupations.push(c.Occupation)
                                //populate participants list based on selected department
                                participants.push(c)
                                total_participants.push(c)
                                //create initial partiicpant list
                                let html = createParticipantList(c);
                                document.querySelector("#participants-table").insertAdjacentHTML("beforeend",html);
                            }
                        })
                        //create new field in the geojson for the selected participants
                        feature.properties["participants"] = participants;
                        //make departments with participants more opaque
                        let fillOpacity = participants.length > 0 ? 0.7:0.3; 
                        //style
                        return {
                            fillColor:"#2d8659",
                            fillOpacity:fillOpacity,
                            color:"white",
                            weight:1,
                            pane:"tilePane"
                        }
                    },
                    onEachFeature:function(feature,layer){
                        layer.on("click",function(e){
                            filter = true;
                            //set selected department as active
                            filters[0] = feature.properties.name;
                            document.querySelector("#department").value = feature.properties.name;

                            filterParticipants();
                            colombia.setStyle(resetStyle)
                        })
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
                //create departments list
                departments.forEach(function(elem){
                    let item =  "<option value='" + elem + "' label='" + elem.charAt(0).toUpperCase() + elem.slice(1) + "'></option>";
                    document.querySelector("#department").insertAdjacentHTML("beforeend",item)
                })
                //create participant list
                function createParticipantList(b){
                    let html = "";
                    
                    //if (b["Participation ID"])
                    //    html += "<tr class='participant'><th class='id'>" + b["Participation ID"] + "</th>";

                    html += "<th class='city part-row'>" + b["City"] + "</th>";
                    html += "<th class='age part-row'>" + b["Age"] + "</th>";
                    html += "<th class='gender part-row'>" + b["Sex"] + "</th>";
                    html += "<th class='setting part-row'>" + b["Setting (rural vs urban)"] + "</th>";
                    html += "<th class='occupation part-row'>" + b["Occupation"] + "</th></tr>";

                    return html;
                }
                //filter participant list
                function filterParticipants(){
                    console.log(filters)
                    //get list element from the sidebar
                    document.querySelectorAll(".part-row").forEach(function(elem){
                        elem.remove();
                    });
                    let html = "", current_participants = 0;
                    total_participants.forEach(function(b){
                        if((filters[2] == b["Sex"] || filters[2] == 'all')&&
                            (filters[1] == b["Age"] || filters[1] == 'all')&&
                            (filters[3] == b["Setting (rural vs urban)"] || filters[3] == 'all')&&
                            (filters[4] == b["Occupation"] || filters[4] == 'all')&&
                            (filters[0] == b["Departments"] || filters[0] == 'all')){
                            current_participants++;
                            html += createParticipantList(b);
                        }
                    })

                    if (current_participants == 0)
                        html += "<p id='none'>No participants found.</p>" 
                                        
                    document.querySelector("#participants-table").insertAdjacentHTML("beforeend",html);
                }
                //create dropown filters for demographics
                document.querySelectorAll(".dropdown").forEach(function(elem,i){
                    elem.addEventListener("change",function(e){                        
                        filters[i] = e.target.value;
                        filter = true;
                        //if (department)
                        filterParticipants();  
                        
                        colombia.setStyle(resetStyle)
                    })
                })
                //reset button
                document.querySelector("#reset").addEventListener("click",function(elem){
                    document.querySelectorAll(".part-row").forEach(function(elem){
                        elem.remove();
                    });
                    if (document.querySelector("#none"))
                        document.querySelector("#none").remove();
                    
                    department = "";
                    document.querySelectorAll(".dropdown").forEach(function(elem,i){
                        elem.value = "all";
                        filters = ["all", "all", "all", "all","all"];
                    })
                    filter = false;
                    colombia.setStyle(resetStyle)
                })
                //reset style
                function resetStyle(feature){
                    let currentFilter = false;

                    feature.properties.participants.forEach(function(b){
                        if((filters[2] == b["Sex"] || filters[2] == 'all')&&
                        (filters[1] == b["Age"] || filters[1] == 'all')&&
                        (filters[3] == b["Setting (rural vs urban)"] || filters[3] == 'all')&&
                        (filters[4] == b["Occupation"] || filters[4] == 'all')&&
                        (filters[0] == b["Departments"] || filters[0] == 'all')){
                            currentFilter = true;
                        }
                        if (filter == false){
                            let html = createParticipantList(b);
                            document.querySelector("#participants-table").insertAdjacentHTML("beforeend",html);
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
