/**
 * NOTE:
 * I did not write any of the code below. This was existing code that I was
 * tasked with improving. The file post-changes can be found in the
 * tabSquareNew.js file.
 */

var Leuly = Leuly || {};

Leuly.TabSquare = (function ($) {
    var my = {};

    var i = 0;
    var tabLabel = "";

    my.templateBaseUrl = "/Areas/Websites/Templates/";
    my.tabSquareId = '';
    my.isTabEditing = false;
    my.editTabSquareId = 0;
    my.maxSliderValue = 50;
    my.baseURL = "/Websites/Page/";

    my.tabSquareId = 0;
    my.saveTabSquare = false;

    my.TabEditor = new Array();
   // my.TextEditor = null;

    my.TabEditor[0] = null;
    my.TabEditor[1] = null;
    my.TabEditor[2] = null;

    my.popoverContent = $("#wordTextSection");
    my.popoverContainer = $("#tabSettingsPopup");

    my.Initialize = function (event) {

        $("#cancelTabSettingsPopup").click(my.cancelSettings);
        $("#saveTabSettingsPopup").click(function () {
            my.saveTabSquare = true;
            $.fancybox.close();
        });

        $("#tabsEditor").on("click", "a", my.selectTab);

        $('#tabsEditor').on("click", "#groupContentView div.active", my.activateContent);
        
        $("#tabsEditor").on("dblclick", ".tabEditable", my.renameTab);

        $('#tabsEditor').on('focusout', 'input', my.saveNewLabel);

        $('#tabsEditor').on('keypress', 'input', my.saveNewLabelEnter);

        $("#tabsEditor").on('click', '.closeTab', my.removeTab);

        $('#tabsEditor').on('click', '.addTab', my.addNewTab);

       /* for (var k = 0; k < my.Editor.length; k++) {
            var activeTab = "";
            var activeContent = "";
            $('#tabsEditor').on('blur', '.shTabEditor' + my.Editor[k], function () {
                activeTab = $('#tabsEditor a[data-target="#tsTab' + my.Editor[k] + '"]').trigger('click');
                activeTab.parent().addClass('active');
                activeContent = $('#tabsEditor #tsTab' + my.Editor[k]);
                activeContent.addClass('active');
            });
        }*/

    };

    my.activateContent = function (e) {
        var tabId = $(this).attr('id');
        var tab = $('a[data-target="#' + tabId + '"]');
       // tab.show();
        tab.parent().addClass('active');
        $(this).addClass('active');
    };

    my.addNewTab = function (e) {
        e.preventDefault();
        i++;
        var current = $('#tabsEditor #groupTabsView li.active').find('a').attr('data-target');
        $('#tabsEditor #groupTabsView li.active').removeClass('active activeTab');
        var active = $('#tabsEditor #groupContentView').find(current);
        active.removeClass('active activeTab');

        var newHtmlTab = '<li class="active activeTab"><a data-target="#tsTab' + i + '" id="' + i +
            '" data-toggle="tab"> <button class="close closeTab" type="button" >×</button><div class="tabEditable"> Double-click here to rename </div></a></li>\n';
        var newContent = '<div class="tab-pane active activeTab" id="tsTab' + i + '">\n<div id="shTabEditor' + i + '"> Go ahead&hellip;</div>\n</div>\n';

        $('#tabsEditor #groupTabsView').prepend(newHtmlTab);
        $('#tabsEditor #groupContentView').prepend(newContent);

        if (my.TabEditor[i] != null) {
            CKEDITOR.remove(my.TabEditor[i]);
            my.TabEditor[i].destroy();
            my.TabEditor[i] = null;
        }

        my.TabEditor[i] = CKEDITOR.replace('shTabEditor' + i, { height: 400, removeButtons: 'uploadimage' });
        CKEDITOR.scriptLoader.load(['https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', 'https://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.min.js']);
        my.TabEditor[i].setData("Add tab content here ... ");

        i++;
    };

    my.removeTab = function (e) {
        e.preventDefault();
        //there are multiple elements which has .closeTab icon so close the tab whose close icon is clicked
        var tabContentId = $(this).parent().attr("data-target");
        var id = $(this).parent().attr('id');
        if (my.TabEditor[id] != null) {
            CKEDITOR.remove(my.TabEditor[id]);
            my.TabEditor[id].destroy();
            my.TabEditor[id] = null;
        }
        $(this).parent().parent().remove(); //remove li of tab
        $(tabContentId).remove(); //remove respective tab content
        $('#groupTabsView a:first').tab('show'); // Select first tab
        $('#groupTabsView a:first').parent().addClass('activeTab');
        var current = $('#tabsEditor #groupTabsView li.active').find('a').attr('data-target');
        var active = $('#tabsEditor #groupContentView').find(current);
        active.addClass('active activeTab');
    };

    my.selectTab = function (e) {
       //e.preventDefault();
        var current = $('#tabsEditor #groupTabsView li.active').find('a').attr('data-target');
        $('#tabsEditor #groupTabsView li.active').removeClass('active activeTab');
        var active = $('#tabsEditor #groupContentView').find(current);
        active.removeClass('active activeTab');
        var beActive = $(this).attr('data-target');
        $(this).tab('show');
        $(this).parent().addClass("activeTab");
        active = $('#tabsEditor #groupContentView').find(beActive);
        active.addClass('active activeTab');
    };

    my.renameTab = function (e) {
        e.preventDefault();
        tabLabel = $(this).html();
        var parent = $(this).parent();
        parent.html('<input id="homeTab" type="text" value="' + tabLabel + '"></input>');
        parent.children("input#homeTab").focus();
    }

    my.saveNewLabel = function () {
        var newTabName = $('#tabsEditor input').val();
        var anchor = $(this).parent();
        if (newTabName != "") {
            anchor.html('<button class="close closeTab" type="button" >×</button> <div class="tabEditable">' + newTabName + "</div>");
        }
        else {
            anchor.html('<button class="close closeTab" type="button" >×</button> <div class="tabEditable">' + tabLabel + "</div>");
        }
    };

    my.saveNewLabelEnter = function (e) {
        if (e.which == 13) {
            var newTabName = $('#tabsEditor input').val();
            var anchor = $(this).parent();
            anchor.html('<button class="close closeTab" type="button" >×</button> <div class="tabEditable">' + newTabName + "</div>");
        }
    };

    my.changeSize = function (event, ui) {
        /// <summary>
        /// change the size of the element
        /// </summary>

        var bar = $(this);
        bar.prev().find("span").html(ui.value);
        $("#" + my.tabSquareId).css(bar.attr("data-style"), ui.value + "px");
    };

    my.addTabSquare = function (columnID, nextID, successMethod) {

        square = { PageID: $("#PageID").val(), Type: Leuly.PageEditor.SquareType.Tab, TextValue:'<ul class="nav nav-tabs " id="groupTabsView'+ i +'" data-tabs="tabs"><li class="active">' +
            '<a data-target="#tsTab'+ i +'" id="' + i + '" data-toggle="tab"><div>Double-click here to rename tab</div></a> </li> </ul>' +
            '<div class="tab-content" id="groupContentView' + i + '"><div class="tab-pane active" id="tsTab' + i + '">' +
            '<div>Add Content Here </div></div></div>', Height: 60 };
        square.SquareData = my.getSquareData(square);
        square.Type = square.SquareData.SquareType;

        Leuly.PageEditor.saveSquare(square, columnID, nextID, function (success, id) {
            if (success) {
                square.SquareData.Html = square.SquareData.Html.replace("[tabId]", "id=\"000000000000000000000000\"");
                successMethod(square, id);
            }
        });
    };

   /* my.getClearText = function (strSrc) {
        /// <summary>
        /// Get tag cleared text 
        /// </summary>
        return strSrc.replace(/<[^<|>]+?>/gi, '');
    };*/

    my.openSettings = function (id) {
        /// <summary>
        /// open tab square settings to edit
        /// </summary>

        var tabsOnPage = $('#page-content a[data-target ^= "#tsTab"]').map(function () { return this.id }).get();
        for (var t = 0; t < tabsOnPage.length; t++) {
            var num = parseInt(tabsOnPage[t]);
            if (i <= num)
                i = num + 1;
        }

        my.tabSquareId = id;

        var tabs = $('#' + id + ' a[data-target^="#tsTab"]').map(function () { return this.id }).get();
        var tabLabels = $('#' + id + ' a[data-target^="#tsTab"] div').map(function () { return $(this).html() }).get();
        var tabContent = $('#' + id + ' [id^="tsTab"] div').map(function () { return $(this).html() }).get();

        //my.GetTabSquareStyleSettings("show");
        $("#saveTabSettingsPopup").focus(); //set focus to popup save button to close toolbar tab

        var htmlTemplate = "tabSquareInnerHtml.html";
        var templateData = my.getTemplateData(tabs, tabLabels, tabContent, true);

        var squareHtml = "";
        Leuly.TemplateManager.GetTemplate(htmlTemplate, function (template, success) {
            squareHtml = Mustache.render(template, templateData);
        }, my.templateBaseUrl);

        var tabsedit = $("#tabsEditor");
        tabsedit.html(squareHtml);

        //fancy box for Displaying Settings Popup
        $.fancybox({
            href: '#tabSettingsPopup',
            autoScale: true,
            centerOnScroll: true,
            autoDimensions: false,
            modal: true,
            beforeClose: function () {
                my.closeEditTabPopup(); //close popup event    
                for (var j = 0; j <= i; j++) {
                    var tabId = tabs[j];
                    if (tabs.length == 0)
                        tabId = i;
                    if (my.TabEditor[tabId] != null) {
                        CKEDITOR.remove(my.TabEditor[tabId]);
                        my.TabEditor[tabId].destroy();
                        my.TabEditor[tabId] = null;
                    }
                }
            },
            afterLoad: function () {
                setTimeout(function () {

                    $(".sortable").sortable();

                    var activeTab = "";
                    var activeContent = "";
                    var activeTabId = 0;

                    var j = 0;

                    do {
                        var tabId = tabs[j];
                        if (tabs.length == 0)
                            tabId = i;
                        my.TabEditor[tabId] = null;
                        my.TabEditor[tabId] = CKEDITOR.replace('shTabEditor' + tabId, {
                            height: 400, removeButtons: 'uploadimage',
                        });
                        CKEDITOR.scriptLoader.load(['https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', 'https://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.min.js']);
                        
                        my.TabEditor[tabId].setData($("#" + my.tabSquareId).find("#shTabEditor" + tabId).html());
                   
                        j++

                    } while (j < tabs.length);

                }, 100);
            }
        });
    };

    my.getTemplateData = function (incomingTabIds, incomingTabLabels, incomingTabContents, editor) {
        //
        // Function to determine the output for the tab square
        // tabIds: List of ids of tabs already on the page
        // tabLabels: List of labels of tabs on the page
        // tabContents: List of content of tabs on the page
        // editor: bool value of whether the tab square is being edited or not
        //

        var data = {
            tabId: "",
            notEditor: !editor,
            i: i,
            tabLabels: [{
                First: true,
                active: "active",
                id: i,
                tabLabel: "Double-click to rename tab"
            }],
            editor: editor,
            tabContents: [{
                id: i,
                First: true,
                active: "active",
                tabContent: "This should be the initial load of the tab square"
            }]
        };
        var content;
        var label;

        if (incomingTabIds.length == 0) {
            i++;
            data.i = i;
            data.tabLabels[0].id = i;
            data.tabContents[0].id = i;
        }

        for (var j = 0; j < incomingTabIds.length; j++) {
            var tabId = incomingTabIds[j];


                data.tabLabels[j] = {
                    First: true,
                    active: "active",
                    id: i,
                    tabLabel: "Double-click to rename tab"
                };
                data.tabContents[j] = {
                    id: i,
                    First: true,
                    active: "active",
                    tabContent: "This should be the initial load of the tab square"
                };

            
            if (j > 0) {
                data.tabLabels[j].First = false;
                data.tabContents[j].First = false;
            }
            data.tabLabels[j].id = tabId;
            if (!editor) {
                label = incomingTabLabels[j];
                data.tabLabels[j].tabLabel = label.replace(/^[ ]+|[ ]+$/g, '');
                content = my.TabEditor[tabId].getData();
                data.tabContents[j].tabContent = content;
            }
            else {
                data.tabLabels[j].tabLabel = incomingTabLabels[j].trim();
                data.tabContents[j].tabContent = incomingTabContents[j];
            }

            data.tabContents[j].id = tabId;

        }

        return data;
    };

    my.closeEditTabPopup = function () {
        /// <summary>
        /// close popup event
        /// </summary>

        if (my.saveTabSquare) {
            my.saveSettings(); //save tab square changes
        }
        else {
            my.GetTabSquareStyleSettings("close"); //revert tab square changes
        }
    };

    my.editSquare = function (element) {
        /// <summary>
        /// edit tab square
        /// </summary>

        my.openSettings(element.find('.square').attr("id"));
    };

    my.InitializeTabEditor = function () {
        /// <summary>
        /// bootstrap tab editor events 
        /// </summary>

        // set the toolbar settings
        $('#tabEditor a[title]').tooltip({ container: '#tabSettingsPopup' });

        $('[data-role=magic-overlay]').each(function () {
            var overlay = $(this), target = $(overlay.data('target'));
            overlay.css('opacity', 0).css('position', 'absolute').offset(target.offset()).width(target.outerWidth()).height(target.outerHeight());
        });
    };

    my.UpdateTextSquareValue = function () {
        /// <summary>
        /// update text square in DOM
        /// </summary>

        var result = my.TabEditor.getData();
        $("#" + my.tabSquareId).find(".sh-tab-value").html(result);
    };

    my.cancelSettings = function () {
        /// <summary>
        /// Cancel Tab Settings Popup
        /// </summary>

        $.fancybox.close();
    };

    my.saveSettings = function () {
        /// <summary>
        /// Save Tab Settings
        /// </summary>

        var tabElement = $("#" + my.tabSquareId);
        var tabs = $('#tabsEditor').find('a[data-target^="#tsTab"]').map(function () { return this.id }).get();
        var tabLabels = $('#tabsEditor').find('.tabEditable').map(function () { return $(this).html() }).get();
        /* var tabContent = $('#tabsEditor').find('[id^="tsTab"]').map(function () { return $(this).html() }).get();*/
        var tabContent = [];
        for (var k = 0; k < tabs.length; k++) {
            tabContent[k] = my.TabEditor[tabs[k]].getData();
        }

        var htmlInside = "";
        var htmlTemplate = "tabSquareInnerHtml.html";
        var templateData = my.getTemplateData(tabs, tabLabels, tabContent, false);

        Leuly.TemplateManager.GetTemplate(htmlTemplate, function (template, success) {
            htmlInside = Mustache.render(template, templateData);
        }, my.templateBaseUrl);

        htmlTemplate = "TabSquareSpecificHtmlTemplate.html";
        templateData = {
            tabId: "id = " + my.tabSquareId,
            textValue: "[tabValue]"
        };

        var squareHtml = "";
        Leuly.TemplateManager.GetTemplate(htmlTemplate, function (template, success) {
            squareHtml = Mustache.render(template, templateData);
            squareHtml = squareHtml.replace('[tabValue]', htmlInside);
        }, my.templateBaseUrl);

        var tabValue = squareHtml;
        var editedTabSquare = { "Id": my.tabSquareId, "Html": squareHtml, "CssClass": "", "SquareType": Leuly.PageEditor.SquareType.Tab, "TextValue": tabValue, "TextID": '' };


        //update DOM
        $(tabElement).html(tabValue); //set tab square element
        //update DB
        Leuly.PageEditor.updateSquare(editedTabSquare);
        //clear save flag
        my.saveTabSquare = false;

    };

    my.GetTabSquareStyleSettings = function (mode) {
        /// <summary>
        /// Get Tab Square Style Settings in Fancybox close event
        /// </summary>

        var tabSquareId = my.tabSquareId;
        var tabElement = $("#" + tabSquareId);
        var colorTransparent = 'transparent';

        $.ajaxSetup({ cache: false });

        $.getJSON(my.baseURL + 'GetSquare', { pageId: $("#PageID").val(), squareId: tabSquareId },
         function (squareResult) {
             if (mode == "close") {
                 // set the value from the database
                 my.TabData = squareResult.TextValue;

                 $('#spaceBackgroundColor').minicolors('value', ' ');
                 $("#spaceBackgroundColor").minicolors('opacity', 0.00);

                 $('#spaceBorderColor').minicolors('value', ' ');
                 $("#spaceBorderColor").minicolors('opacity', 0.00);

                 $('#spaceFontColor').minicolors('value', ' ');
                 $(".barBorder").prev().find("span").html(0);
                 $("#barHeight").slider('value', 0)
                 $("#barBorderThickness").slider('value', 0)
                 $("#barRounded").slider('value', 0)

                 if (squareResult.Style != null) {

                     $(tabElement).css('border', "solid " + squareResult.Style.BorderWidth + "px " + squareResult.Style.BorderColor);
                     $(tabElement).css('background-color', squareResult.Style.BackgroundColor);
                     $(tabElement).css('padding', squareResult.Style.Padding + "px ");
                     $(tabElement).css('border-radius', squareResult.Style.Corner + "px ");
                 }
                 else {
                     $(tabElement).css('border', '');
                     $(tabElement).css('background-color', '');
                     $(tabElement).css('color', '');
                     $(tabElement).css('padding-top', '');
                     $(tabElement).css('border-radius', '');
                 }
                 $(tabElement).css('color', '');

             }
             else if (mode == "show") {
                 my.TabData = squareResult.TextValue;

                 $('#spaceBackgroundColor').minicolors('value', ' ');
                 $("#spaceBackgroundColor").minicolors('opacity', 0.00);

                 $('#spaceBorderColor').minicolors('value', ' ');
                 $("#spaceBorderColor").minicolors('opacity', 0.00);

                 //$('#spaceFontColor').minicolors('value', ' ');

                 $(".barBorder").prev().find("span").html(0);
                 $("#barHeight").slider('value', 0);
                 $("#barBorderThickness").slider('value', 0);
                 $("#barRounded").slider('value', 0);

                 if (squareResult.Style != null) {

                     if (squareResult.Style.BackgroundColor != null) {
                         if (squareResult.Style.BackgroundColor.trim() == colorTransparent) {
                             $('#spaceBackgroundColor').minicolors('value', ' ');
                         }
                         else {
                             my.SetMiniColorValue("spaceBackgroundColor", squareResult.Style.BackgroundColor);
                         }
                     }

                     if (squareResult.Style.BorderColor != null) {
                         if (squareResult.Style.BorderColor.trim() == colorTransparent) {
                             $('#spaceBorderColor').minicolors('value', ' ');
                         }
                         else {
                             my.SetMiniColorValue("spaceBorderColor", squareResult.Style.BorderColor);
                         }
                     }

                     $("#barHeight").slider('value', squareResult.Style.Padding);
                     $("#barBorderThickness").slider('value', squareResult.Style.BorderWidth);
                     $("#barRounded").slider('value', squareResult.Style.Corner);

                     $("#barHeight").prev().find("span").html(squareResult.Style.Padding);
                     $("#barBorderThickness").prev().find("span").html(squareResult.Style.BorderWidth);
                     $("#barRounded").prev().find("span").html(squareResult.Style.Corner);

                     $(tabElement).css('border', "solid " + squareResult.Style.BorderWidth + "px " + squareResult.Style.BorderColor);
                     $(tabElement).css('background-color', squareResult.Style.BackgroundColor);
                     $(tabElement).css('color', '');
                     $(tabElement).css('padding', squareResult.Style.Padding + "px ");
                     $(tabElement).css('border-radius', squareResult.Style.Corner + "px ");
                 }
                 else {
                     $(tabElement).attr('style', 'border: 0px solid transparent; padding: 0px; border-radius: 0 px; background-color: transparent;');
                 }
             }
         });
    };

    my.SetMiniColorValue = function (miniColorId, color) {
        /// <summary>
        /// set mini color values
        /// </summary>

        var styleColor = color;
        if (styleColor != 'transparent') {
            var count = styleColor.match(/,/g);
            var styleColorSplitValues;
            var colorOpacity = 1;
            if (count != null) {
                if (count.length >= 3) //rgba
                {
                    styleColorSplitValues = styleColor.split(',');
                    styleColor = styleColorSplitValues[0] + ',' + styleColorSplitValues[1] + ',' + styleColorSplitValues[2] + ')';
                    var index = styleColorSplitValues[3].indexOf(')');
                    colorOpacity = styleColorSplitValues[3].substring(0, index);
                    styleColor = Leuly.Util.Rgb2hex(styleColor);
                    $("#" + miniColorId).minicolors('opacity', colorOpacity);
                }
                else if (count.length == 2) //rgb
                {
                    styleColor = Leuly.Util.Rgb2hex(styleColor);
                    $("#" + miniColorId).minicolors('opacity', '1.0');
                }
            }
        }
        $("#" + miniColorId).minicolors('value', styleColor);
    };

    my.generateSquareData = function (element) {
        /// <summary>
        /// Generate square data from element
        /// </summary>
        /// <param name="element">The square element in editor</param>
        var squareData = "";
        var styleObject = $(element);
        try {
            if ($(element).attr('style') != null) {
                var borderThicknessStyle = styleObject.css('border-left-width');
                borderThicknessStyle = Math.round(borderThicknessStyle.substring(0, borderThicknessStyle.indexOf('px')));

                var borderColorStyle = styleObject.css('border-left-color');
                borderColorStyle = Leuly.PageEditor.RoundOpacityValue(borderColorStyle);

                var backgroundColorStyle = styleObject.css('background-color');
                backgroundColorStyle = Leuly.PageEditor.RoundOpacityValue(backgroundColorStyle);

                var fontColorStyle = styleObject.css('color');
                fontColorStyle = Leuly.Util.Rgb2hex(fontColorStyle); //hex value is suitable to set font color

                var paddingStyle = styleObject.css('padding-top');
                paddingStyle = Math.round(paddingStyle.substring(0, paddingStyle.indexOf('px')));

                var roundedCornerStyle = styleObject.css('border-top-left-radius');
                var roundedCornerIndex = roundedCornerStyle.indexOf('px');
                roundedCornerStyle = roundedCornerStyle.substring(0, roundedCornerIndex);
                roundedCornerStyle = Math.round(roundedCornerStyle);
                squareData = { "Id": $(element).attr("id"), "Html": $(element).html(), "CssClass": "", "SquareType": Leuly.PageEditor.SquareType.Tab, "TextValue": $(element).find(".sh-tab-value").html(), "TextID": $(element).find(".editable").attr("id"), Style: { "BorderWidth": borderThicknessStyle, "BorderColor": borderColorStyle, "BackgroundColor": backgroundColorStyle, "FontColor": fontColorStyle, "Padding": paddingStyle, "Corner": roundedCornerStyle } };
            }
            else {
                squareData = { "Id": $(element).attr("id"), "Html": $(element).html(), "CssClass": "", "SquareType": Leuly.PageEditor.SquareType.Tab, "TextValue": $(element).find(".sh-tab-value").html(), "TextID": $(element).find(".editable").attr("id") };
            }
        } catch (err) {
            return false;
        }
        return squareData;
    };

    my.getSquareHtml = function (square) {
        /// <summary>
        /// Generate html for square
        /// </summary>
        /// <param name="square">The square json object</param>
        /// <return name="squareHtml">The square html</param>

        var htmlTemplate = "tabSquareInnerHtml.html";
        var templateData = {
            tabId: "id = " + square.TextIdString,
            textValue: "[tabValue]"
        };

        var squareHtml = "";
        Leuly.TemplateManager.GetTemplate(htmlTemplate, function (template, success) {
            squareHtml = Mustache.render(template, templateData);
            squareHtml = squareHtml.replace('[tabValue]', square.TextValue);
        }, my.templateBaseUrl);

        htmlTemplate = "TabSquareSpecificHtmlTemplate.html";

        squareHtml = "";
        Leuly.TemplateManager.GetTemplate(htmlTemplate, function (template, success) {
            squareHtml = Mustache.render(template, templateData);
            squareHtml = squareHtml.replace('[tabValue]', square.TextValue);
        }, my.templateBaseUrl);

        return squareHtml;
    };

    my.getSquareData = function (squareData) {
        /// <summary>
        /// Generate json object for square data.
        /// </summary>
        /// <param name="squareData">The square json object</param>
        /// <return name="squareDataJson">The square data in json format</param>

        var htmlTemplate = "TabSquareSpecificHtmlTemplate.html";
        var templateData = {
            tabId: "id=\"000000000000000000000000\"",
            textValue: squareData.TextValue
        };
        var squareSpecificContents = "";
        Leuly.TemplateManager.GetTemplate(htmlTemplate, function (template, success) {
            squareSpecificContents = Mustache.render(template, templateData);
        }, my.templateBaseUrl);
        var htmlContent = Leuly.PageEditor.getSquareHtml(squareSpecificContents, Leuly.PageEditor.SquareType.Tab);
        var squareDataJson = { "Id": "", "SquareType": Leuly.PageEditor.SquareType.Tab, "Html": htmlContent, "CssClass": "", "TextValue": squareData.TextValue, "TextID": "" };

        return squareDataJson;
    };

    my.formatSquareContentAsHtml = function (squareElement) {
        var squarehtml = "";
        var tabStyle = $(squareElement).attr('style');
        if (tabStyle != null) {
            squarehtml = "<div style='" + tabStyle + "'>" + $(squareElement).children().html() + "</div>";
        }
        else {
            squarehtml = $(squareElement).children().html();
        }

        return squarehtml;
    };

    return my;

} (jQuery));

$(document).ready(function () {
    Leuly.TabSquare.Initialize();
});