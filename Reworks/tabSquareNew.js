/**
 * NOTE:
 * This is code that I improved on. While making optimizations, I also was 
 * able to reduce the number of lines of code. 
 * The original code can be found in the tabSquareOld.js file.
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

    my.innerTemplate = '';
    my.htmlTemplate = '';

    my.TabEditor = null;
    my.tabHasBeenDeleted = false;

    my.popoverContent = $("#wordTextSection");
    my.popoverContainer = $("#tabSettingsPopup");

    my.Initialize = function (event) {

        $("#cancelTabSettingsPopup").off('click').on('click', my.cancelSettings);

        $("#saveTabSettingsPopup").off('click').on('click',function () {
            my.saveTabSquare = true;
            $.fancybox.close();
        });

        $('#tabsEditor').off('click', '.nav-tabs a').on('click', '.nav-tabs a', my.selectTab);

        $('#tabsEditor').off('focusout', 'input').on('focusout', 'input', my.saveNewLabel);

        $('#tabsEditor').off('keypress', 'input').on('keypress', 'input', my.saveNewLabelEnter);

        $("#tabsEditor").off('click', '.closeTab').on('click', '.closeTab', my.removeTab);

        $('#tabsEditor').off('click', '.addTab').on('click', '.addTab', my.addNewTab);

        Leuly.TemplateManager.GetTemplate("TabSquareSpecificHtmlTemplate.html", function (template, success) {
            my.htmlTemplate = template;
        }, my.templateBaseUrl);

        Leuly.TemplateManager.GetTemplate("tabSquareInnerHtml.html", function (template, success) {
            my.innerTemplate = template;
        }, my.templateBaseUrl);
        
    };
    

    my.addNewTab = function (e) {
        i++;
        var current = $('#tabsEditor #groupTabsView li.active').find('a').attr('data-target');
        $('#tabsEditor #groupTabsView li.active').removeClass('active activeTab');
        $('#tabsEditor #groupContentView').find(current).removeClass('active activeTab');

        var newHtmlTab = '<li class="active activeTab"><a data-target="#tsTab' + i + '" id="' + i +
            '" data-toggle="tab"><div class="tabEditable"> Click to rename tab </div><i class="close closeTab fa fa-close"></i></a></li>\n';
        var newContent = '<div class="tab-pane active activeTab" id="tsTab' + i + '">\n<div id="shTabEditor' + i + '"> Go ahead&hellip;</div>\n</div>\n';

        $('#tabsEditor #groupTabsView').prepend(newHtmlTab);
        $('#tabsEditor #groupContentView').prepend(newContent);

        if (my.TabEditor != null) {
            CKEDITOR.remove(my.TabEditor);
            my.TabEditor.destroy();
            my.TabEditor = null;
        }

        my.TabEditor = CKEDITOR.replace('shTabEditor' + i, { height: 400});
        my.TabEditor.setData("Add tab content here ... ");

        i++;
    };

    my.removeTab = function (e) {
        //there are multiple elements which has .closeTab icon so close the tab whose close icon is clicked
        var tabContentId = $(this).parent().attr('data-target');
        var id = $(this).parent().attr('id');
        var tabToRemove = $(this).parent().parent(); //remove li of tab
        
        var contentToRemove = $('#tabsEditor ' + tabContentId);
        var isActive = tabToRemove.hasClass('active');

        if (isActive) {
            if (my.TabEditor != null) {
                CKEDITOR.remove(my.TabEditor);
                my.TabEditor.destroy();
                my.TabEditor = null;
            }
            tabToRemove.remove(); //remove respective tab content
            contentToRemove.remove();

            if ($('#tabsEditor .nav-tabs li.active').length === 0) {
                var current = $('#tabsEditor #groupTabsView li:first');
                current.tab('show');
                current.addClass('active');
                current = current.find('a').attr('data-target');
                active = $('#tabsEditor #groupContentView').find(current);
                active.addClass('active activeTab');

                my.TabEditor = CKEDITOR.replace('shTabEditor' + current.substring(current.length - 1), { height: 400 });
            }
            my.tabHasBeenDeleted = false;
        } else {
            tabToRemove.remove(); //remove respective tab content
            contentToRemove.remove();
            my.tabHasBeenDeleted = tabContentId;
        }
    };

    my.selectTab = function (e) {
        $(this).focus();

        if ( $(this).parent().hasClass('addTab') || $(this).hasClass('addTab') )
            return;

        if ( $(this).parent().hasClass('active') || $(this).hasClass('active') ) {
            my.renameTab($(this));
            return;
        }

        if ($(this).find('#homeTab').length > 0)
            return;

        if (!($(this).find('input').length) && !!($('#tabsEditor input').length)) {
            my.saveNewLabel();
        }

        if (my.tabHasBeenDeleted) {
            if ($('#tabsEditor .nav-tabs li.active').length === 0) {
                var current = $('#tabsEditor #groupTabsView li:first');
                current.tab('show');
                current = current.find('a').attr('data-target');
                active = $('#tabsEditor #groupContentView').find(current);
                active.addClass('active activeTab');

                if (my.TabEditor != null) {
                    CKEDITOR.remove(my.TabEditor);
                    my.TabEditor.destroy();
                    my.TabEditor = null;
                }

                my.TabEditor = CKEDITOR.replace('shTabEditor' + current.substring(current.length - 1), { height: 400 });
            }
            my.tabHasBeenDeleted = false;
            return;
        }

        var current = $('#tabsEditor #groupTabsView li.active').find('a').attr('data-target');
        $('#tabsEditor #groupTabsView li.active').removeClass('active activeTab');
        var active = $('#tabsEditor #groupContentView').find(current);
        active.removeClass('active activeTab');
        var beActive = $(this).attr('data-target');
        $(this).tab('show');
        $(this).parent().addClass("activeTab");
        active = $('#tabsEditor #groupContentView').find(beActive);
        active.addClass('active activeTab');

        if (my.TabEditor != null) {
            CKEDITOR.remove(my.TabEditor);
            my.TabEditor.destroy();
            my.TabEditor = null;
        }

        my.TabEditor = CKEDITOR.replace('shTabEditor' + beActive.substring(beActive.length - 1), { height: 400 });
    };

    my.renameTab = function (tab) {
        tabLabel = tab.find('.tabEditable').html();
        var parent = tab.find('.tabEditable').parent();
        parent.html('<input id="homeTab" type="text" value="' + tabLabel + '"></input>');
        parent.children("input#homeTab").focus();
    }

    my.saveNewLabel = function (e) {
        var newTabName = $('#tabsEditor input').val();
        var anchor = $('#tabsEditor input').parent();
        if (newTabName != "") {
            anchor.html('<div class="tabEditable">' + newTabName + '</div><i class="close closeTab fa fa-close"></i>');
        }
        else {
            anchor.html('<div class="tabEditable">' + tabLabel + '</div><i class="close closeTab fa fa-close"></i>');
        }
    };

    my.saveNewLabelEnter = function (e) {
        if (e.which == 13) {
            var newTabName = $('#tabsEditor input').val();
            var anchor = $('#tabsEditor input').parent();
            anchor.html('<div class="tabEditable">' + newTabName + '</div><i class="close closeTab fa fa-close"></i>');
        }
    };

    my.changeSize = function (event, ui) {
        /// <summary>
        /// change the size of the element
        /// </summary>

        var bar = $(this);
        bar.prev().find("span").html(ui.value);
    };

    my.addTabSquare = function (columnID, nextID, successMethod) {

        square = {
            PageID: $("#PageID").val(),
            Type: Leuly.PageEditor.SquareType.Tab,
            TextValue: '<ul class="nav nav-tabs " id="groupTabsView' + i + '" data-tabs="tabs"><li class="active">' +
            '<a data-target="#tsTab'+ i +'" id="' + i + '" data-toggle="tab"><div>Click to rename tab</div></a> </li> </ul>' +
            '<div class="tab-content" id="groupContentView' + i + '"><div class="tab-pane active" id="tsTab' + i + '">' +
            '<div>Add tab content here ... </div></div></div>',
            Height: 60
        };
        square.SquareData = my.getSquareData(square);
        square.Type = square.SquareData.SquareType;

        Leuly.PageEditor.saveSquare(square, columnID, nextID, function (success, id) {
            if (success) {
                square.SquareData.Html = square.SquareData.Html.replace("[tabId]", "id=\"000000000000000000000000\"");
                successMethod(square, id);
            }
        });
    };

    my.openSettings = function (id) {
        /// <summary>
        /// open tab square settings to edit
        /// </summary>

        //Convert all old tab square hrefs to data-targets
        $.each($('a[href*="#tsTab"]'), function (index, value) {
            var val = $(value).attr('href');
            $(value).attr('data-target', val).removeAttr('href');
        });

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
        
        $("#saveTabSettingsPopup").focus(); //set focus to popup save button to close toolbar tab
        
        var templateData = my.getTemplateData(tabs, tabLabels, tabContent, true);

        var squareHtml =  Mustache.render(my.innerTemplate, templateData);

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
                if (my.TabEditor != null) {
                    CKEDITOR.remove(my.TabEditor);
                    my.TabEditor.destroy();
                    my.TabEditor = null;
                }
                my.closeEditTabPopup(); //close popup event    
                for (var j = 0; j <= i; j++) {
                    var tabId = tabs[j];
                    if (tabs.length == 0)
                        tabId = i;
                    
                }
            },
            afterLoad: function () {
                $(".sortable").sortable();
                var tabId = tabs[0];
                if (tabs.length == 0)
                    tabId = i;
                my.TabEditor = null;
                my.TabEditor = CKEDITOR.replace('shTabEditor' + tabId, { height: 400 });
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
                tabLabel: "Click to rename tab"
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
                    tabLabel: "Click to rename tab"
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
                content = incomingTabContents[j];
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
        
        my.saveSettings(); 
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
        var tabContent = [];

        $.each($('#tabsEditor .tab-content .tab-pane'), function (index, value) {
            if ($(value).find('.cke').length > 0) {
                tabContent[index] = my.TabEditor.getData();
            } else {
                tabContent[index] = $(value).find('[id*="shTabEditor"]').html();
            }
        });
        
        var templateData = my.getTemplateData(tabs, tabLabels, tabContent, false);
        var htmlInside = Mustache.render(my.innerTemplate, templateData);
        
        templateData = {
            tabId: "id = " + my.tabSquareId,
            textValue: "[tabValue]"
        };

        var squareHtml = Mustache.render(my.htmlTemplate, templateData).replace('[tabValue]', htmlInside);

        var tabValue = squareHtml;
        var editedTabSquare = { "Id": my.tabSquareId, "Html": squareHtml, "CssClass": "", "SquareType": Leuly.PageEditor.SquareType.Tab, "TextValue": tabValue, "TextID": '' };


        //update DOM
        $(tabElement).html(tabValue); //set tab square element
        //update DB
        Leuly.PageEditor.updateSquare(editedTabSquare);
        //clear save flag
        my.saveTabSquare = false;

    };

    my.generateSquareData = function (element) {
        /// <summary>
        /// Generate square data from element
        /// </summary>
        /// <param name="element">The square element in editor</param>
        var squareData = "";

        squareData = { "Id": $(element).attr("id"), "Html": $(element).html(), "CssClass": "", "SquareType": Leuly.PageEditor.SquareType.Tab, "TextValue": $(element).find(".sh-tab-value").html(), "TextID": $(element).find(".editable").attr("id") };

        return squareData;
    };

    my.getSquareHtml = function (square) {
        /// <summary>
        /// Generate html for square
        /// </summary>
        /// <param name="square">The square json object</param>
        /// <return name="squareHtml">The square html</param>
        
        
        return square.Html;
    };

    my.getSquareData = function (squareData) {
        /// <summary>
        /// Generate json object for square data.
        /// </summary>
        /// <param name="squareData">The square json object</param>
        /// <return name="squareDataJson">The square data in json format</param>
        
        var templateData = {
            tabId: "id=\"000000000000000000000000\"",
            textValue: squareData.TextValue
        };
        var squareSpecificContents = Mustache.render(my.htmlTemplate, templateData);
        var htmlContent = Leuly.PageEditor.getSquareHtml(squareSpecificContents, Leuly.PageEditor.SquareType.Tab);
        var squareDataJson = { "Id": "", "SquareType": Leuly.PageEditor.SquareType.Tab, "Html": htmlContent, "CssClass": "", "TextValue": squareData.TextValue, "TextID": "" };

        return squareDataJson;
    };

    my.formatSquareContentAsHtml = function (squareElement) {
        var squarehtml = "";

        squarehtml = $(squareElement).children().html();

        return squarehtml;
    };

    return my;

} (jQuery));