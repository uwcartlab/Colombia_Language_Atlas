//project javascript information
//To do
//Create filter menu interface for mobile
//Add full list initially
(function(){
    //set audio file types
    let audioFiles = ['Imp 3','Off 6','TN_20'];
    //set default language
    let language = localStorage.getItem("language") ? localStorage.getItem("language") : "espanol";
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
    let total_participants = [],department = 'none',departments = [], department_participants,filter = false, LABEL_RULES, PAINT_RULES;
    //initial map position
    let latlng = L.latLng(4.13, -73.76);
    //create map
    var map = L.map('map',{
        minZoom:5,
        maxZoom:8,
        maxBounds:[
            [-4.23,-80.09],
            [13.57,-66.87]
        ]
    }).setView(latlng, 6);
    //tutorial popup
    let popupContent;
    if (document.body.offsetWidth <= 768){
        if (language == "espanol")
            popupContent = '<p><img width="20" src="../img/icons/person.svg"> Toque para ver y filtrar la lista de participantes.<img id="upper-right" class="invert-arrow" width="25" src="../img/icons/arrow.svg"></p><p>Toque los departamentos en el mapa para ver los participantes de ese departamento.<img id="down" class="invert-arrow" width="25" src="../img/icons/arrow.svg"></p><p id="close">Toque el mapa para cerrar.</p>';
        if (language == "english")
            popupContent = '<p><img width="20" src="../img/icons/person.svg"> Tap to view and filter list of participants. <img id="upper-right" class="invert-arrow" width="25" src="../img/icons/arrow.svg"></p><p>Tap departments on the map to view participants from that department. <img id="down" class="invert-arrow" width="25" src="../img/icons/arrow.svg"></p><p id="close">Tap map to close.</p>';
    }
    else{
        if (language == "espanol")
            popupContent = '<p>Utilice la tabla para filtrar la lista de participantes. <img width="25" id="right" class="invert-arrow" src="../img/icons/arrow.svg"></p><p>Haga clic en los departamentos en el mapa para ver los participantes de ese departamento. <img id="down" class="invert-arrow" width="25" src="../img/icons/arrow.svg"></p>';
        if (language == "english")
            popupContent = '<p>Use table to filter list of participants. <img width="25" id="right" class="invert-arrow" src="../img/icons/arrow.svg"></p><p>Click departments on the map to view participants from that department.<img id="down" class="invert-arrow" width="25" src="../img/icons/arrow.svg"></p>';
    }

    let popup = L.popup({className:"intro"})
        .setLatLng([2.5, -73.76])
        .setContent(popupContent)
        .openOn(map);
    //var popup = L.popup(latlng, {content: '<p>Hello world!<br />This is a nice popup.</p>'})
    //   .openOn(map);
    //create tileset
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        pane:'shadowPane'
    })//.addTo(map);
    getColumbiaData();
    //create map buttons
    let info = L.control();
    info.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this._div.innerHTML = '<button id="reset-small-screen" class="reset" style="display:none"><img src="../img/icons/arrow.svg"></button><button id="table-button"><img src="../img/icons/person.svg"></button><button id="in"><a href="index.html"><img src="../img/icons/info.svg"></a></button>';
        return this._div;
    };
    info.addTo(map)
    //table button for mobile
    document.querySelector("#table-button").addEventListener("click",function(){
        displayTable(false)
    })
    //function for displaying table on mobile
    function displayTable(condition){
        if (document.body.offsetWidth <= 768){
            let display = document.querySelector("#sidebar-container").style.display;

            if (display == 'block')
                if (condition){
                    document.querySelector("#sidebar-container").style.display = 'block';
                    document.querySelector("#reset-small-screen").style.display = 'inline';
                }
                else{
                    document.querySelector("#sidebar-container").style.display = 'none';
                    document.querySelector("#reset-small-screen").style.display = 'none';
                }
            else{  
                document.querySelector("#sidebar-container").style.display = 'block';
                document.querySelector("#reset-small-screen").style.display = 'inline';
            }
        }

    }
    //style basemap data
    function addBackgroundData(){
        //background country data
        PAINT_RULES = [
            {
                dataLayer:"background",
                symbolizer:new protomapsL.PolygonSymbolizer({
                    fill:"#d9d9d9",
                    stroke:"#b3b3b3",
                    opacity:1,
                    width:1
                })
            },
            {
                dataLayer:"colombia_cities",
                symbolizer:new protomapsL.CircleSymbolizer({
                    fill:"#000000",
                    stroke:"#ffffff",
                    radius:2,
                    opacity:pointFilter,
                    width:1
                })
            }
        ]
        //labels
        LABEL_RULES = [
        //country labels
            {
                dataLayer:"country_labels",
                symbolizer: new protomapsL.CenteredTextSymbolizer({
                        labelProps:["name"],
                        font: "12px karrik",
                        fill:"#737373",
                        stroke:"#ffffff",
                        width:0.5,
                        lineHeight:1.5
                    })
            },
        //colombian department labels
            {
                dataLayer:"colombia_labels",
                symbolizer: new protomapsL.CenteredTextSymbolizer({
                        labelProps:["name"],
                        font: departmentFontFilter,
                        fill:departmentColorFilter,
                        stroke:departmentStrokeFilter,
                        weight:0.5,
                        width:departmentWidthFilter,
                        lineHeight:1.5,
                        justify:2
                        
                    })
            },
        //colombia city labels
            {
                dataLayer:"colombia_cities",
                symbolizer: new protomapsL.OffsetTextSymbolizer({
                        labelProps:["name"],
                        font: "14px karrik",
                        fill:cityFilter,
                        stroke:"#ffffff",
                        width:widthFilter,
                        offsetY:-4,
                        lineHeight:1.5
                    })
            }
        ];
        //filter city points
        function pointFilter(x,d){
            if (d.props.adm1name == department)
                return 1;
            else    
                return 0;
        }
        //font filter
        function departmentFontFilter(x,d){
            if (departments.includes(d.props.name))
                return "14px karrik"
            else    
                return "12px karrik"
        }
        //department stroke
        function departmentStrokeFilter(x,d){
            if (departments.includes(d.props.name))
                return "#000000"
            else    
                return "#999999"
        }
        //filter department labels when selected
        function departmentColorFilter(x,d){
            if (department == "none")
                if (departments.includes(d.props.name))
                    return "#ffffff"
                else    
                    return "#e6e6e6"
            else{
                if (d.props.name == department)
                    return "#ffffff";
                else    
                    return "rgba(0,0,0,0)"
            }  
        }
        //filter department stroke width
        function departmentWidthFilter(x,d){
            if (department == "none")
                if (departments.includes(d.props.name))
                    return 1
                else    
                    return 1
            else{
                if (d.props.name == department)
                    return 1;
                else    
                    return 0;
            }  
        }
        //filter city labels
        function cityFilter(x,d){
            if (d.props.adm1name == department)
                return "rgba(0,0,0,1)";
            else    
                return "rgba(0,0,0,0)";
        }
        function widthFilter(x,d){
            if (d.props.adm1name == department)
                return 0.75;
            else    
                return 0;
        }

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
                let occupations = [], genders = [], ages = [], settings = [];
                //create colombia geojson
                let colombia = new L.TopoJSON(data,{
                    style:function(feature){
                        let participants = [];                        
                        //style runs before oneachfeature, so we use the style function to populate the filter arrays
                        csv.forEach(function(c){
                            if (feature.properties.name == c.Departments){
                                //add departments to list
                                if (!departments.includes(feature.properties.name))
                                    departments.push(c.Departments)
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
                                createAudio(c);
                            }
                        })
                        //create new field in the geojson for the selected participants
                        feature.properties["participants"] = participants;
                        //make departments with participants more opaque
                        let fillOpacity = participants.length > 0 ? 0.7:0.3; 
                        //set only layers with data as interactive
                        let interactive = false;
                        if (departments.includes(feature.properties.name))
                            interactive = true;
                        //style
                        return {
                            fillColor:"#2d8659",
                            fillOpacity:fillOpacity,
                            color:"#ffffff",
                            weight:0.5,
                            pane:"tilePane",
                            interactive:interactive
                        }
                    },
                    onEachFeature:function(feature,layer){                        
                        layer.on("click",function(e){
                            filterMap(layer);
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
                    let html = ""

                    html += "<th class='city part-row'><a class='play-audio' id='" + b["Participation ID"] + "'>Audio</a>" + b["City"] + "</th>";
                    html += "<th class='age part-row'>" + b["Age"] + "</th>";
                    html += "<th class='gender part-row'>" + b["Sex"] + "</th>";
                    html += "<th class='setting part-row'>" + b["Setting (rural vs urban)"] + "</th>";
                    html += "<th class='occupation part-row'>" + b["Occupation"] + "</th></tr>";

                    return html;
                }
                //create audio elements
                function createAudio(b){
                    let id = b["Participation ID"];
                    let filePath = "../audio/" + id + "/";

                    document.querySelector("#" + id).addEventListener("click",function(){    
                        if (document.querySelector(".audio-table"))
                            document.querySelector(".audio-table").remove();
                        
                        document.querySelector("body").insertAdjacentHTML("afterbegin","<div class='audio-table'><h2 id='participant'>" + id + "<button id='close-audio'><img src='../img/icons/arrow.svg'></button></h2></div")
                        document.querySelector(".audio-table").style.display = "block";

                        document.querySelector("#close-audio").addEventListener("click",function(elem){
                            document.querySelector(".audio-table").innerHTML = "";
                            document.querySelector(".audio-table").style.display = "none";
                        })

                        audioFiles.forEach(function(file){
                            document.querySelector(".audio-table").insertAdjacentHTML("beforeend","<audio controls type='audio/mpeg' src='" + filePath + file + " - " + id + ".mp3'>")
                        })
                    })
                }
                //restyle map on selected department
                function filterMap(layer){
                    let bounds = layer.getBounds();
                    //add reset button
                    document.querySelector("#reset-small-screen").style.display = 'inline';
                    //document.querySelector("#reset-small-screen").addEventListener("click",resetButton)
                    //center map on selected department
                    map.fitBounds(bounds)
                    //if on mobile, activate table view
                    displayTable(true);
                    //activate department filter
                    filter = true;
                    //set selected department as active
                    department = layer.feature.properties.name
                    filters[0] = layer.feature.properties.name;
                    document.querySelector("#department").value = layer.feature.properties.name;

                    filterParticipants();
                    colombia.setStyle(resetStyle)
                }
                //filter participant list
                function filterParticipants(){
                    //get list element from the sidebar
                    //clear table
                    document.querySelectorAll(".part-row").forEach(function(elem){
                        elem.remove();
                    });
                    document.querySelectorAll("tbody").forEach(function(elem, i){
                        if (i > 0)
                            elem.remove();
                    });
                    if (document.querySelector("#none"))
                        document.querySelector("#none").remove();

                    let html = "", current_participants = 0;
                    total_participants.forEach(function(b){
                        if((filters[2] == b["Sex"] || filters[2] == 'all')&&
                            (filters[1] == b["Age"] || filters[1] == 'all')&&
                            (filters[3] == b["Setting (rural vs urban)"] || filters[3] == 'all')&&
                            (filters[4] == b["Occupation"] || filters[4] == 'all')&&
                            (filters[0] == b["Departments"] || filters[0] == 'all')){
                            current_participants++;
                            html += createParticipantList(b);

                            document.querySelector("#participants-table").insertAdjacentHTML("beforeend",html);
                            createAudio(b);
                        }
                    })

                    if (current_participants == 0)
                        html += "<p id='none'>No participants found.</p>" 
                }
                //create dropown filters for demographics
                document.querySelectorAll(".dropdown").forEach(function(elem,i){
                    elem.addEventListener("change",function(e){                        
                        filters[i] = e.target.value;
                        filter = true;
                        if (elem.name == "department"){
                            colombia.eachLayer(function(layer){
                                if(layer.feature.properties.name == e.target.value)
                                    filterMap(layer)
                            })
                        }
                        else
                            filterParticipants();  
                        //add reset button
                        document.querySelector("#reset-small-screen").style.display = 'inline';

                        colombia.setStyle(resetStyle)
                    })
                })
                //reset button function
                function resetButton(){
                    //clear table
                    document.querySelectorAll("tbody").forEach(function(elem, i){
                        if (i > 0)
                            elem.remove();
                    }); 
                    //reset table
                     document.querySelectorAll(".part-row").forEach(function(elem){
                        elem.remove();
                    });
                    if (document.querySelector("#none"))
                        document.querySelector("#none").remove();
                    //if on small screens, set table display to none
                    displayTable(false)
                    //reset department to defautl
                    department = "none";
                    //reset all filters
                    document.querySelectorAll(".dropdown").forEach(function(elem,i){
                        elem.value = "all";
                        filters = ["all", "all", "all", "all","all"];
                    })
                    filter = false;
                    //set map view to default
                    map.setView([4.11, -73.76], 6)
                    colombia.setStyle(resetStyle)
                    //remove reset button
                    document.querySelector("#reset-small-screen").style.display = 'none';
                    //hide table on small screen 
                    if (document.body.offsetWidth <= 768)
                        document.querySelector("#sidebar-container").style.display = 'none';

                }
                document.querySelectorAll(".reset").forEach(function(elem){
                    elem.addEventListener("click",function(elem){
                        resetButton();
                    })
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
                            createAudio(b);
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
