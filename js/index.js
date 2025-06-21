(function(){
    let language = "espanol";

    localStorage.setItem("language", language);
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