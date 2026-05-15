(function(){
    if (!localStorage.getItem("language"))
        var language = "espanol"; 
    else
        var language = localStorage.getItem("language"); 
    
    var unusedLanguage = language == "espanol" ? "english" : "espanol";

    localStorage.setItem("language", language);
    document.querySelector("#" + language).classList.add("active")

    //set language 
    document.querySelectorAll("." + language).forEach(function(elem){
        elem.style.display = 'block';
    })
    document.querySelectorAll("." + unusedLanguage).forEach(function(elem){
        elem.style.display = 'none';
    })
    //select language
    document.querySelectorAll(".language").forEach(function(elem, i){
        elem.addEventListener("click",function(){
            //highlight selected languge button
            document.querySelectorAll(".language").forEach(function(x){
                if (x.classList.contains("active")){
                    x.classList.remove("active")
                }
            })
            elem.classList.add("active")
            //hide unselected language elements
            elementDisplay("none")
            //set active language
            language = elem.id;
            localStorage.setItem("language", language);
            //show selected language elements
            //hide unselected language elements
            elementDisplay("block")
            //hide/show element function
            function elementDisplay(display){
                document.querySelectorAll("." + language).forEach(function(x){
                    x.style.display = display;
                })
            }
        })
    })
})();