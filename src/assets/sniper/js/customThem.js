var x, i, j, l, ll, selElmnt, a, b, c, lang;
lang = localStorage.getItem("lang");
/*look for any elements with the class "custom-select":*/
x = document.getElementsByClassName("custom-select1");
var parent = document.getElementById("panelScrollConiner");
l = x.length;
for (i = 0; i < l; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    if (selElmnt) {
        ll = selElmnt.length;
    }

    /*for each element, create a new DIV that will act as the selected item:*/
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    if (selElmnt) {
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    }

    x[i].appendChild(a);
    /*for each element, create a new DIV that will contain the option list:*/
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 1; j < ll; j++) {
        /*for each option in the original select element,
        create a new DIV that will act as an option item:*/
        c = document.createElement("DIV");
        c.innerHTML = selElmnt.options[j].innerHTML;
        c.addEventListener("click", function (e) {
            /*when an item is clicked, update the original select box,
            and the selected item:*/
            var y, i, k, s, h, sl, yl;
            s = this.parentNode.parentNode.getElementsByTagName("select")[0];
            sl = s.length;
            h = this.parentNode.previousSibling;
            for (i = 0; i < sl; i++) {
                if (s.options[i].innerHTML == this.innerHTML) {
                    s.selectedIndex = i;
                    h.innerHTML = this.innerHTML;
                    y = this.parentNode.getElementsByClassName("same-as-selected");
                    yl = y.length;
                    for (k = 0; k < yl; k++) {
                        y[k].removeAttribute("class");
                    }
                    this.setAttribute("class", "same-as-selected");
                    break;
                }
            }
            h.click();
        });
        b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function (e) {
        /*when the select box is clicked, close any other select boxes,
        and open/close the current select box:*/
        e.stopPropagation();
        closeAllSelect(e);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
    });
}

function closeAllSelect(elmnt) {
    /*a function that will close all select boxes in the document,
    except the current select box:*/

    var x, y, i, xl, yl, arrNo = [];
    //console.log(elmnt.target, elmnt.target.dataset.index);
    //elmnt.setAttribute("style", "left:0;");
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    if (elmnt.target.dataset) {
        
        if (elmnt.target.dataset.index) {
            if (parent) {
                
                if(lang == "ar")
                {
                    parent.style.right = (elmnt.target.dataset.index * (-60)) + "px";
                    newPositionSlideX = (elmnt.target.dataset.index * (-60));
                }
                else{
                    parent.style.left = (elmnt.target.dataset.index * (-60)) + "px";
                    newPositionSlideX = (elmnt.target.dataset.index * (-60));
                }
                
                check();
            }
        }



    }



    // if (c.length > 1) {
    //     var selectedElement = document.querySelector(".active");
    //     selectedElement.classList.remove("active");
    //     var newSelectedElement = document.querySelector(".active");
    //     newSelectedElement.classList.add("active");
    //     console.log(newSelectedElement, newSelectedElement.dataset.index);
    // }
    // else
    // {
    //     var selectedElement = document.querySelector(".active");
    //     console.log(selectedElement, selectedElement.dataset.index)

    // }

    //selectedElement.classList.remove("active");


    //console.log(elmnt);

    // while((selectedElement.previousSibling)!=null)     
    // {
    //     i = i+1;

    // }
    // console.log(i);


    // customElement[0].setAttribute("style", "position:absolute !important;left:0px !important;");
    // 
    xl = x.length;
    yl = y.length;
    for (i = 0; i < yl; i++) {
        if (elmnt == y[i]) {
            arrNo.push(i)
        } else {
            y[i].classList.remove("select-arrow-active");
        }
    }
    for (i = 0; i < xl; i++) {
        if (arrNo.indexOf(i)) {
            x[i].classList.add("select-hide");
        }
    }
}

/*if the user clicks anywhere outside the select box,
then close all select boxes:*/
document.addEventListener("click", closeAllSelect);

// // tab slider 
// var element = $('.tab-container_new li');
// var slider = $('.tab-container_new');
// var sliderWrapper = $('.wrapper_new');
// var totalWidth = sliderWrapper.innerWidth();
// var elementWidth = element.outerWidth();
// var newPositionSlideX = 0;
// var sliderWidth = 0;
// sliderWrapper.append('<span class="prev-slide"></span><span class="next-slide"></span>');

// element.each(function () {
//     sliderWidth = sliderWidth + $(this).outerWidth() + 1;
// });

// slider.css({
//     'width': sliderWidth
// });
var newPositionSlideX = 0;
var sliderWidth = 0;
$('.next-slide').on("click", function () {
    
    lang = localStorage.getItem("lang");
    var sliderWrapper = $('.wrapper_new');
    var slider = $('.tab-container_new');
    var element = $('.tab-container_new li').parent();
    sliderWidth = 0;
    var liElements = document.querySelectorAll("ul#panelScrollConiner > li");

    // element.each(function () {
    //     sliderWidth = sliderWidth + $(this).outerWidth() + 1;
    //     //sliderWidth = sliderWidth + 60;

    // });


    liElements.forEach(function () {

        sliderWidth = sliderWidth + 60;

    });
    var totalWidth = sliderWrapper.innerWidth();

    // var elementWidth = element.outerWidth();


    check();

    // if (newPositionSlideX > (totalWidth - sliderWidth)) {
    if (newPositionSlideX >= (liElements.length-3)*(-60)) {
        //newPositionSlideX = newPositionSlideX - elementWidth;
        newPositionSlideX = newPositionSlideX - 60;
    }

    if (lang == "ar") {
        slider.css({
            'right': newPositionSlideX
        }, check());
    }
    else {
        slider.css({
            'left': newPositionSlideX
        }, check());
    }
});

$('.prev-slide').on("click", function () {


    var slider = $('.tab-container_new');
    var element = $('.tab-container_new li');
    element.each(function () {
        // sliderWidth = sliderWidth + $(this).outerWidth() + 1;
        // sliderWidth = sliderWidth +60;
    });

    var elementWidth = element.outerWidth();
    lang = localStorage.getItem("lang");
    //positionSlideX = (lang == "ar" ? slider.position().right : slider.position().left);

    check();
    if (newPositionSlideX >= -sliderWidth) {
        
        //newPositionSlideX = newPositionSlideX + elementWidth;
        newPositionSlideX = newPositionSlideX + 60;


    }
    if (lang == "ar") {
        slider.css({
            'right': newPositionSlideX
        }, check());
    }
    else {
        slider.css({
            'left': newPositionSlideX
        }, check());
    }
});



function check() {


    var sliderWrapper = $('.wrapper_new');
    var totalWidth = sliderWrapper.innerWidth();
    var element = $('.tab-container_new li');
    element.each(function () {
        sliderWidth = sliderWidth + $(this).outerWidth() + 1;
        //sliderWidth = sliderWidth + 60;
    });

    
    lang = localStorage.getItem("lang");

    if (sliderWidth >= totalWidth && newPositionSlideX > (totalWidth - sliderWidth)) {
        if (lang == "ar") {
            $('.next-slide').css({
                'left': 0
            });
        }
        else {
            $('.next-slide').css({
                'right': 0
            });
        }

    } else {
        if (lang == "ar") {
            $('.next-slide').css({
                'right': -$(this).width()
            });
        }
        else {

            $('.next-slide').css({
                'left': -$(this).width()
            });
        }

    };

    if (newPositionSlideX < 0) {
        if (lang == "ar") {
            $('.prev-slide').css({
                'right': 0
            });
        }
        else {
            $('.prev-slide').css({
                'left': 0
            });
        }

    } else {
        if (lang == "ar") {
            $('.prev-slide').css({
                'right': -$(this).width()
            });
        }
        else {
            $('.prev-slide').css({
                'left': -$(this).width()
            });
        }

    };


};

$(window).on("resize", function () {
    //var sliderWrapper = $('.wrapper_new');
    //var totalWidth = sliderWrapper.innerWidth();    
    //totalWidth = sliderWrapper.innerWidth();
    check();
});
check();


// function setLanguage(lng)
// {
//     lang = lng;
//     positionSlideX = (lang == "ar" ? slider.position().right : slider.position().left);
// }