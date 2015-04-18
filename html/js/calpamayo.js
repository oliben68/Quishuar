(function(){
    if (!String.format) {
        String.format = function(format) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function(match, number) { 
                return typeof args[number] != 'undefined'
                    ? args[number] 
                    : match;
                });
        };
    }
})();

var button_states = ["div.inactive-state", "div.active-state"];
var active_nav_button = "._header " + button_states[1];
var nav_buttons_query = "._header " + button_states.toString(); 
var header_controls = button_states.concat("div._logo");
var header_controls_query = "._header " + header_controls.toString();
var current_language = cssResources("::before")["default-language"];
var css_Resources = cssResources("::before");
var active_page = cssResources("::before")["default-page"];
var loaded = false;
var current_language_data = {};
var current_portrait = cssResources("::before")["default-portrait"];

function mouseHover(button, status) {
    if (button.attr("class").indexOf("inactive-state") < 0) {
        return;
    }

    if (status == "enter") {
        mask = cssResources("::before")["hover-inactive-background-mask"];
        opacity = ("::before")["active-nav-button-opacity"];
    } else {
        mask = cssResources("::before")["inactive-background-mask"];
        opacity = ("::before")["inactive-nav-button-opacity"];
    }

    background_image = cssResources("::before")["img-root"] +
        current_language +
        "/" + button.attr("id") +
        "." + current_language + ".png";

    button.css("background-image", String.format(mask, background_image));
    button.css("opacity", opacity);
}

function getActivePage() {
    return $("._header " + "div.active-state").attr("id");
}

function waiting(msg) {
    busy_msg = (msg == undefined) 
        ? current_language_data["busy-msg"] + "..."
        : current_language_data["busy-msg"] + ": " + msg + "...";

    $.blockUI({ message: '<img src="' + cssResources("::before")["img-root"] +
            cssResources("::before")["busy-screen"]["busy-gif"] + '" height="16" width="16" alt="" />'
            + '&nbsp;&nbsp;' + busy_msg,
            css: cssResources("::before")["busy-screen"]["css"] });
}

function done_waiting() {
    setTimeout(function(){$.unblockUI()}, cssResources("::before")["busy-screen"]["timeOut"]);
}

function onClick(button, event) {
    waiting();

    active_page = button.attr("id");

    // Getting active button before aspect change
    nav_button_list = $(active_nav_button);
    current_active_nav_button = $($(active_nav_button)[0]).attr("id");

    // Set the nav-buttons list
    if (current_active_nav_button != active_page) {
        nav_button_list.push(button);
    }

    // Change buttons aspect
    $.each(nav_button_list, function() {
        setNavButtonAspect($(this));
    });
    done_waiting();
}

function getLanguageSelectorData() {
    language_data = [];
    $.each($(__content__.languages), function() {
            lang_data = {
                text: this["language-selector"]["name"],
                value : this["id"],
                selected : (this["id"] == current_language),
                imageSrc : this["language-selector"]["flag"]};
            language_data.push(lang_data);
            });
    
    return language_data;
}

function setLanguage(lang) {
	current_language = lang
	
    // Getting language data
    $.each($(__content__.languages), function() {
        current_language_data = this;
        return (this["id"] != current_language);});

    waiting();

    // Change buttons aspect
    $.each($(nav_buttons_query), function() {
        setNavButtonAspect($(this));
    });

    // Change title
    classes = $("#title").attr('class').split(' ');
    
    if (classes.length == 2) {
    	$("#title").removeClass(classes[1]);
    }
    $("#title").addClass("_title-" + current_language);
    //$("#title").css("background-image", "title." + current_language + ".png");

    // Change text(s)
    done_waiting();
}

function setNavButtonAspect(nav_button) {
    active_page = typeof(active_page) == undefined || active_page == null 
                    ? cssResources("::before")["default-page"]
                    : active_page;

    current_portrait = typeof(current_portrait) == undefined || current_portrait == null 
                    ? cssResources("::before")["default-portrait"]
                    : current_portrait;
                    
    $('._portait').css("background-image", current_portrait);

    is_active_page = (nav_button.attr("id") == active_page);

    // Set classes
    nav_button.removeClass();
    nav_button.addClass([is_active_page ? "active-state" : "inactive-state", 
        nav_button.attr("id") + "-nav-button-" + current_language].toString().replace(",", " "));

    // Background images
    mask = is_active_page
            ? cssResources("::before")["active-background-mask"]
            : cssResources("::before")["inactive-background-mask"];

    background_image = cssResources("::before")["img-root"] +
        current_language +
        "/" + nav_button.attr("id") +
        "." + current_language + ".png";

    background_image_css = String.format(mask, background_image);
    nav_button.css("background-image", background_image_css);

    
    // Opacity
    opacity_css = is_active_page
        ? cssResources("::before")["active-nav-button-opacity"]
        : cssResources("::before")["inactive-nav-button-opacity"];
    nav_button.css("opacity", opacity_css);
}

function cssResources(pseudo_tag) {
    var style = null;
    if ( window.getComputedStyle &&
            window.getComputedStyle(document.head, pseudo_tag) ) {
        style = window.getComputedStyle(document.head, pseudo_tag);
        style = style.content;
    } else {
        window.getComputedStyle = function(el) {
            this.el = el;
            this.getPropertyValue = function(prop) {
                var re = /(\-([a-z]){1})/g;
                if (re.test(prop)) {
                    prop = prop.replace(re, function () {
                        return arguments[2].toUpperCase();
                    });
                }
                return el.currentStyle[prop] ? el.currentStyle[prop] : null;
            };
            return this;
        };
        style = window.getComputedStyle(document.getElementsByTagName('head')[0]);
        style = style.getPropertyValue('font-family');
    }
    removeQuotes = function (string) {
        if (typeof string === 'string' || string instanceof String) {
            string = string.replace(/"\[/g, '[').replace(/^['"]+|\s+|\\|(;\s?})+|['"]$/g, '').replace(/"\]"/g, '"]');
        }
        return string;
    };
    
    return JSON.parse(removeQuotes(style));
}

function addImagToDiv(jQuery_str, img_url, additional_style) {

    additional_format = typeof(additional_format) == undefined
                                || additional_format == null
                        ? ''
                        : additional_format;

    $(jQuery_str).css('background-image', String.format('url({0}) {1}', img_url, additional_format));
}