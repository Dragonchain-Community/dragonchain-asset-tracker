var authorityCustodianId = "e2634eb5-b462-41f2-8d35-99f25f8cbbd0";

var state = {
    currentAuthenticatedCustodianId: authorityCustodianId,
    custodians: null,
    assetGroups: null,
    assets: null
} 

// Fancy utility function //
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var tools = {
    setView: async (options) => {

        if (options.view == "custodians")
        {
            $("#current-view-title").text("Custodians")

            $("#current-view-content").html($("#loading").html())

            var custodians = await tools.getFromAPI("custodians");

            if (typeof custodians !== "undefined")
            {
                state.custodians = custodians;

                var table = $("<table>")
                                .addClass("table")
                                .append(
                                    $("<thead/>").addClass("thead-dark")
                                        .append(
                                            $("<tr/>")
                                                .append($("<th/>").text("Custodian Type"))
                                                .append($("<th/>").text("Custodian ID"))
                                                .append($("<th/>").text("Custodian Name"))
                                                .append($("<th/>").text("Custodian Description"))
                                                .append($("<th/>").text("Current Assets"))
                                        )
                                )


                $.each (custodians, function (index, item) {
                    table.append(
                        $("<tr/>")
                            .append($("<td/>").text(item.type))
                            .append($("<td/>").html(item.id  + ' <a href="#" class="badge badge-success load-modal-view" rel="object-verifications" data-id="' + item.id +'">Verifications</a>'))
                            .append($("<td/>").text(item.current_external_data != null ? item.current_external_data.data.name : "N/A"))
                            .append($("<td/>").addClass("text-truncate").css("max-width","500px").text(item.current_external_data != null ? item.current_external_data.data.description : "N/A"))
                            .append($("<td/>")
                                .append(
                                    item.assets.length > 0 ? $("<button/>").addClass("btn btn-primary set-view").attr("rel", "custodian-assets").attr("data-id", item.id).html("View Assets <span class='badge badge-light'>" + item.assets.length + "</span>") : $("<span/>").text("N/A")
                                )
                            )
                    )
                })

                var addButton = $("<div/>").addClass("fixed-bottom").append(
                        $("<button/>")
                            .addClass("load-add-custodian-modal")
                            .addClass("btn-lg")
                            .addClass("btn-primary")
                            .addClass("rounded-circle")                                    
                            .addClass("float-right")    
                            .addClass("mr-3")
                            .addClass("mb-3")        
                            .html("+")
                )

                var div = $("<div/>");

                div.append(table);
                div.append(addButton);

                $("#current-view-content").html(div);
            }
            
        }

        if (options.view == "asset-groups")
        {
            $("#current-view-title").text("Asset Groups")

            $("#current-view-content").html($("#loading").html())

            var assetGroups = await tools.getFromAPI("asset-groups");

            if (typeof assetGroups !== "undefined")
            {
                state.assetGroups = assetGroups;

                var table = $("<table>")
                                .addClass("table")
                                .append(
                                    $("<thead/>").addClass("thead-dark")
                                        .append(
                                            $("<tr/>")                                                
                                                .append($("<th/>").text("Asset Group ID"))
                                                .append($("<th/>").text("Asset Group Name"))
                                                .append($("<th/>").text("Asset Group Description"))
                                                .append($("<th/>").text("Issued Supply"))
                                                .append($("<th/>").text("Max Supply"))
                                        )
                                )


                $.each (assetGroups, function (index, item) {
                    table.append(
                        $("<tr/>")                            
                            .append($("<td/>").html(item.id  + ' <a href="#" class="badge badge-success load-modal-view" rel="object-verifications" data-id="' + item.id +'">Verifications</a>'))  
                            .append($("<td/>").text(item.name))
                            .append($("<td/>").addClass("text-truncate").css("max-width","500px").text(item.description))
                            .append($("<td/>").text(item.issuedSupply))
                            .append($("<td/>").text(item.maxSupply != null ? item.maxSupply : "Unlimited"))
                            
                    )
                })

                var addButton = $("<div/>").addClass("fixed-bottom").append(
                    $("<button/>")
                        .addClass("load-add-asset-group-modal")
                        .addClass("btn-lg")
                        .addClass("btn-primary")
                        .addClass("rounded-circle")                                    
                        .addClass("float-right")    
                        .addClass("mr-3")
                        .addClass("mb-3")        
                        .html("+")
                )

                var div = $("<div/>");

                div.append(table);
                div.append(addButton);

                $("#current-view-content").html(div);
            }
        }

        if (options.view == "assets")
        {
            $("#current-view-title").text("Assets")

            $("#current-view-content").html($("#loading").html())

            var assets = await tools.getFromAPI("assets");

            if (typeof assets !== "undefined")
            {
                state.assets = assets;

                var table = $("<table>")
                                .addClass("table")
                                .append(
                                    $("<thead/>").addClass("thead-dark")
                                        .append(
                                            $("<tr/>")                                                
                                                .append($("<th/>").text("Item ID"))                                                
                                                .append($("<th/>").text("Item External ID"))
                                                .append($("<th/>").text("Item Name"))
                                                .append($("<th/>").text("Item Description"))
                                                .append($("<th/>").text("View Details"))
                                        )
                                )


                $.each (assets, function (index, item) {
                    var optionsButton = $("<div/>").addClass("btn-group")
                                            .append(
                                                $("<button/>")
                                                    .addClass("btn btn-primary load-modal-view")
                                                    .attr("rel", "asset-details")
                                                    .attr("data-id", item.id)
                                                    .html("View Details")
                                            )
                                            .append(
                                                $("<button/>")
                                                    .addClass("btn btn-primary dropdown-toggle dropdown-toggle-split")
                                                    .attr("data-toggle", "dropdown")
                                            )
                                            .append(
                                                $("<div/>")
                                                    .addClass("dropdown-menu")
                                                    .append(
                                                        $("<a/>")
                                                            .addClass("dropdown-item load-modal-view")
                                                            .attr("rel", "view-asset-history")
                                                            .attr("data-id", item.id)
                                                            .attr("href", "#")
                                                            .html("View History")
                                                    )
                                                    .append(
                                                        $("<a/>")
                                                            .addClass("dropdown-item load-authorize-transfer-modal")                                                            
                                                            .attr("data-id", item.id)
                                                            .attr("href", "#")                                                            
                                                            .html("Authorize Transfer")                                                            
                                                    )

                                                    .append(
                                                        $("<a/>")
                                                            .addClass("dropdown-item load-accept-transfer-modal")                                                            
                                                            .attr("data-id", item.id)
                                                            .attr("href", "#")                                                            
                                                            .html("Accept Transfer")
                                                    )
                                            )

                    table.append(
                        $("<tr/>")                            
                            .append($("<td/>").html(item.id  + ' <a href="#" class="badge badge-success load-modal-view" rel="object-verifications" data-id="' + item.id +'">Verifications</a>'))                            
                            .append($("<td/>").text(item.current_external_data != null ? item.current_external_data.id : "N/A"))
                            .append($("<td/>").text(item.current_external_data != null ? item.current_external_data.data.name : "N/A"))
                            .append($("<td/>").addClass("text-truncate").css("max-width","500px").text(item.current_external_data != null ? item.current_external_data.data.description : "N/A"))
                            .append($("<td/>")
                                .append(optionsButton)
                            )
                    )
                })

                var addButton = $("<div/>").addClass("fixed-bottom").append(
                    $("<button/>")                        
                        .addClass("btn-lg btn-primary rounded-circle float-right mr-3 mb-3")        
                        .addClass("load-add-asset-modal")
                        .html("+")
                )

                var div = $("<div/>");

                div.append(table);
                div.append(addButton);

                $("#current-view-content").html(div);
            }
        }
        
        if (options.view == "custodian-assets")
        {
            $("#current-view-title").text("Custodian Assets")

            $("#current-view-content").html($("#loading").html())

            var custodian = await tools.getFromAPI("custodians/" + options.id);

            $("#current-view-title").text("Custodian Assets for " + custodian.id + " (" + custodian.type + ")")

            var assets = await tools.getFromAPI("custodian/assets/" + options.id)

            if (typeof assets !== "undefined")
            {
                state.assets = assets;

                var table = $("<table>")
                                .addClass("table")
                                .append(
                                    $("<thead/>").addClass("thead-dark")
                                        .append(
                                            $("<tr/>")                                                
                                                .append($("<th/>").text("Item ID"))                                                
                                                .append($("<th/>").text("Item External ID"))
                                                .append($("<th/>").text("Item Name"))
                                                .append($("<th/>").text("Item Description"))
                                                .append($("<th/>").text("View Details"))
                                        )
                                )


                $.each (assets, function (index, item) {
                    var optionsButton = $("<div/>").addClass("btn-group")
                                            .append(
                                                $("<button/>")
                                                    .addClass("btn btn-primary load-modal-view")
                                                    .attr("rel", "asset-details")
                                                    .attr("data-id", item.id)
                                                    .html("View Details")
                                            )
                                            .append(
                                                $("<button/>")
                                                    .addClass("btn btn-primary dropdown-toggle dropdown-toggle-split")
                                                    .attr("data-toggle", "dropdown")
                                            )
                                            .append(
                                                $("<div/>")
                                                    .addClass("dropdown-menu")
                                                    .append(
                                                        $("<a/>")
                                                            .addClass("dropdown-item load-modal-view")
                                                            .attr("rel", "view-asset-history")
                                                            .attr("data-id", item.id)
                                                            .attr("href", "#")
                                                            .html("View History")
                                                    )
                                                    .append(
                                                        $("<a/>")
                                                            .addClass("dropdown-item load-authorize-transfer-modal")                                                            
                                                            .attr("data-id", item.id)
                                                            .attr("href", "#")                                                            
                                                            .html("Authorize Transfer")                                                            
                                                    )

                                                    .append(
                                                        $("<a/>")
                                                            .addClass("dropdown-item load-accept-transfer-modal")                                                            
                                                            .attr("data-id", item.id)
                                                            .attr("href", "#")                                                            
                                                            .html("Accept Transfer")
                                                    )
                                            )
                    table.append(
                        $("<tr/>")                            
                            .append($("<td/>").html(item.id  + ' <a href="#" class="badge badge-success load-modal-view" rel="object-verifications" data-id="' + item.id +'">Verifications</a>'))                            
                            .append($("<td/>").text(typeof item.current_external_data.id !== "undefined" ? item.current_external_data.id : "N/A"))
                            .append($("<td/>").text(typeof item.current_external_data.data !== "undefined" ? item.current_external_data.data.name : "N/A"))
                            .append($("<td/>").addClass("text-truncate").css("max-width","500px").text(typeof item.current_external_data.data !== "undefined" ? item.current_external_data.data.description : "N/A"))
                            .append($("<td/>")
                                .append(optionsButton)
                            )
                    )
                })

                $("#current-view-content").html(table);
            }
        }
    },

    loadModalView: async (options) => {

        if (options.view == "asset-details")
        {
            $("#modal .modal-title").text("Asset Details")

            $("#modal .modal-body .container-fluid").html($("#loading").html())

            $("#modal").modal();

            var asset = await tools.getFromAPI("assets/" + options.id);

            if (typeof asset !== "undefined")
            {
                var div = $("<div/>").addClass("row");

                if (typeof asset.current_external_data.data !== "undefined" && typeof asset.current_external_data.data.image_url !== "undefined")
                {
                    div.append(
                        $("<div/>")
                            .addClass("col-3")
                            .append(
                                $("<img/>")
                                    .attr("src", asset.current_external_data.data.image_url)
                                    .addClass("img-fluid img-thumbnail")
                            )
                    )
                }

                div.append(
                    $("<div/>")
                        .addClass("col-9")
                        .append($("<pre/>").html(JSON.stringify(asset, null, 2)))
                )

                $("#modal .modal-body .container-fluid").html(div);
            }
            
        }

        if (options.view == "view-asset-history")
        {
            $("#modal .modal-title").text("Asset History")

            $("#modal .modal-body .container-fluid").html($("#loading").html())

            $("#modal").modal();

            var assetTransactions = await tools.getFromAPI("assets/history/" + options.id);

            var div = $("<div/>");

            $.each(assetTransactions, function (index, item) {
                var itemDiv = $("<div/>").addClass("row");

                var responseTypes = item.payload.response.type.split(",");                
                var actions = [];

                if (responseTypes.includes("asset"))
                    actions.push("Asset Created");

                if (responseTypes.includes("asset_external_data"))
                    actions.push("Asset External Data Changed");

                if (responseTypes.includes("asset_transfer_authorization"))
                    actions.push("Asset Transfer Authorized");

                if (responseTypes.includes("asset_transfer"))
                    actions.push("Asset Transferred");
                
                var actionString = "";
                for (var j = 0; j < actions.length; j++)
                    actionString += actions[j] + (j < actions.length - 1 ? " | " : ""); 

                
                itemDiv.append(
                    $("<div/>").addClass("col py-2")
                        .append(
                            $("<div/>").addClass("card")
                                .append(
                                    $("<div/>").addClass("card-body")
                                        .append(
                                            $("<div/>").addClass("float-right text-muted").html(new Date(parseInt(item.header.timestamp) * 1000).toLocaleString())                                            
                                        )
                                        .append(
                                            $("<p/>").addClass("card-title text-muted").html("<b>Transaction ID: " + item.header.txn_id  + '</b> <a href="#" class="badge badge-success load-modal-view" rel="object-verifications" data-id="' + item.header.invoker +'">Verifications</a>')
                                        )
                                        .append(
                                            $("<p/>").addClass("card-text").html(actionString)
                                        )
                                        .append(
                                            $("<button/>").addClass("btn btn-sm btn-outline-secondary")
                                                .attr("data-toggle", "collapse")
                                                .attr("data-target", "#details-" + item.header.txn_id)
                                                .html("Transaction Details")
                                        )
                                        .append(
                                            $("<div/>").addClass("collapse border")
                                                .attr("id", "details-" + item.header.txn_id)
                                                .append(
                                                    $("<pre/>").addClass("p-2 overflow-auto bg-dark text-light").css("max-height", "300px")
                                                        .html(JSON.stringify(item, null, 2))
                                                )
                                        )
                                )
                        )
                )

                div.append(itemDiv)
            })

            $("#modal .modal-body .container-fluid").html(div);
            
            
        }
        
        if (options.view == "object-verifications")
        {
            $("#modal .modal-title").text("Dragon Net Object Verifications")

            $("#modal .modal-body .container-fluid").html($("#loading").html())

            $("#modal").modal();

            var verifications = await tools.getFromAPI("verifications/" + options.id);

            if (typeof verifications !== "undefined")
            {
                var table = $("<table>")
                                .addClass("table")
                                .append(
                                    $("<thead/>").addClass("thead-dark")
                                        .append(
                                            $("<tr/>")
                                                .append($("<th/>").text("Node Level"))
                                                .append($("<th/>").text("Resource Name"))
                                                .append($("<th/>").text("TIME Applied"))
                                                .append($("<th/>").text("Date of Verification"))
                                        )
                                )


                $.each (verifications, function (i, verificationLevel) {
                    $.each(verificationLevel, function (j, verification) {
                        table.append(
                            $("<tr/>")
                                .append($("<td/>").text(i))
                                .append($("<td/>").text(verification.dcrn))
                                .append($("<td/>").text(verification.header.current_ddss))
                                .append($("<td/>").text(new Date(parseInt(verification.header.timestamp) * 1000).toString()))
                        )
                    })
                })
                
                $("#modal .modal-body .container-fluid").html(table);
            }
            
        }
    },

    getFromAPI: async (path) => {        
        return $.ajax(
            "http://127.0.0.1:3030/" + path,
            {
                type: "GET",            
                dataType:"json",
                headers: {
                    "Authorization": "Basic " + btoa(state.currentAuthenticatedCustodianId + ":mypassword")
                }
            }
        )
            .done(function (data) {
                return data;                
            })
            .catch(function (error) {
                alert(error.responseJSON.message);
                console.error(error.responseJSON.message);
            })
            
    },

    postToAPI: async (path, object, custodianId) => {

        var authenticatedCustodianId = state.currentAuthenticatedCustodianId;

        if (typeof custodianId !== "undefined")
            authenticatedCustodianId = custodianId;


        return $.ajax(
            "http://127.0.0.1:3030/" + path,
            {
                type: "POST",            
                dataType:"json",
                headers: {
                    "Authorization": "Basic " + btoa(authenticatedCustodianId + ":mypassword")
                },
                data: object
            }
        )
            .done(function (data) {
                return data;                
            })
            .catch(function (error) {
                alert(error.responseJSON.message);
                console.error(error.responseJSON.message);
            })
    },
}

$().ready(() => {
    tools.setView({view: "custodians"});

    $(document).on("click", ".set-view", function () {
        $(".set-view").removeClass("active")
        
        $(this).addClass("active")

        tools.setView({
            view: $(this).attr("rel"),
            id: $(this).attr("data-id") 
        })        
    })

    $(document).on("click", ".load-modal-view", function () {
        tools.loadModalView({
            view: $(this).attr("rel"),
            id: $(this).attr("data-id") 
        })        
    })

    $(document).on("click", ".load-add-custodian-modal", function () {        
        $("#modal-add-custodian").modal();    
    })

    $("#frm-add-custodian").submit(function (e) {
        e.preventDefault();

        $("#frm-add-custodian button").attr("disabled", "disabled").button('refresh');
        $("#frm-add-custodian .spinner-grow").removeClass("invisible");

        var custodianObj = {	
            "custodian": {
                "type": $("#newCustodianType").val(),
                "external_data": {
                    "id": $("#newCustodianExternalId").val() != "" ? $("#newCustodianExternalId").val() : null,
                    "data": {
                        "name": $("#newCustodianName").val() != "" ? $("#newCustodianName").val() : null,
                        "description": $("#newCustodianDescription").val() != "" ? $("#newCustodianDescription").val() : null
                    }
                }
            }
        }

        tools.postToAPI("custodians", custodianObj)
            .then(function (requestTxnData) {
                console.log(requestTxnData);
            })
            .finally(function () {
                // Sleep long enough for block to be written, then close modal and refresh the custodian view //
                sleep(6000)
                    .then(function () {                                                
                        $("#modal-add-custodian").modal("hide");

                        $("#frm-add-custodian").trigger("reset");

                        $("#frm-add-custodian button").removeAttr("disabled").button('refresh');
                        $("#frm-add-custodian .spinner-grow").addClass("invisible");

                        tools.setView({view: "custodians"});
                    })
            });

        
    })

    $(document).on("click", ".load-add-asset-group-modal", function () {        
        $("#modal-add-asset-group").modal();    
    })

    $("#frm-add-asset-group").submit(function (e) {
        e.preventDefault();

        $("#frm-add-asset-group button").attr("disabled", "disabled").button('refresh');
        $("#frm-add-asset-group .spinner-grow").removeClass("invisible");

        var assetGroupObj = {	
            "asset_group": {
                "name": $("#newAssetGroupName").val() != "" ? $("#newAssetGroupName").val() : null,
                "description": $("#newAssetGroupDescription").val() != "" ? $("#newAssetGroupDescription").val() : null,
                "maxSupply": $("#newAssetGroupMaxSupply").val() != "" ? $("#newAssetGroupMaxSupply").val() : null
            }
        }

        tools.postToAPI("asset-groups", assetGroupObj)
            .then(function (requestTxnData) {
                console.log(requestTxnData);
            })
            .finally(function () {
                // Sleep long enough for block to be written, then close modal and refresh the custodian view //
                sleep(6000)
                    .then(function () {                                                
                        $("#modal-add-asset-group").modal("hide");

                        $("#frm-add-asset-group").trigger("reset");

                        $("#frm-add-asset-group button").removeAttr("disabled").button('refresh');
                        $("#frm-add-asset-group .spinner-grow").addClass("invisible");

                        tools.setView({view: "asset-groups"});
                    })
            });

        
    })

    $(document).on("click", ".load-add-asset-modal", function () {        
        // Refresh the options for Asset Group dropdown //
        tools.getFromAPI("asset-groups")
            .then(function (data) {
                state.assetGroups = data;

                $("#newAssetAssetGroup").html("");
                for (var i = 0; i < state.assetGroups.length; i++)        
                    $("#newAssetAssetGroup").append($("<option/>").attr("value", state.assetGroups[i].id).html(state.assetGroups[i].name));
                
                // Set a default microtime value for external ID //
                $("#newAssetExternalId").val(new Date().getTime())

                $("#modal-add-asset").modal();    
            })        
    })

    $("#frm-add-asset").submit(function (e) {
        e.preventDefault();

        $("#frm-add-asset button").attr("disabled", "disabled").button('refresh');
        $("#frm-add-asset .spinner-grow").removeClass("invisible");

        var assetObj = {	
            "asset": {
                "assetGroupId": $("#newAssetAssetGroup").val()
            }
        }
        
        // If ANY external data is specified, create the whole external_data object, otherwise don't attach at all //
        if ($("#newAssetExternalId").val() != "" || $("#newAssetName").val() != "" || $("#newAssetDescription").val() != "" || $("#newAssetColor").val() != "" || $("#newAssetImageURL").val() != "")
        {
            assetObj.asset.external_data = {
                "id": $("#newAssetExternalId").val() != "" ? $("#newAssetExternalId").val() : null,
                "data": {
                    "name": $("#newAssetName").val() != "" ? $("#newAssetName").val() : null,
                    "description": $("#newAssetDescription").val() != "" ? $("#newAssetDescription").val() : null,
                    "color": $("#newAssetColor").val() != "" ? $("#newAssetColor").val() : null,
                    "image_url": $("#newAssetImageURL").val() != "" ? $("#newAssetImageURL").val() : null
                }
            }
        }

        tools.postToAPI("assets", assetObj)
            .then(function (requestTxnData) {
                console.log(requestTxnData);
            })
            .finally(function () {
                // Sleep long enough for block to be written, then close modal and refresh the custodian view //
                sleep(6000)
                    .then(function () {                                                
                        $("#modal-add-asset").modal("hide");

                        $("#frm-add-asset").trigger("reset");

                        $("#frm-add-asset button").removeAttr("disabled").button('refresh');
                        $("#frm-add-asset .spinner-grow").addClass("invisible");

                        tools.setView({view: "assets"});
                    })
            });        
    })

    $(document).on("click", ".load-authorize-transfer-modal", function () {        

        tools.getFromAPI("assets/" + $(this).attr("data-id"))
            .then(function (asset) {

                if (asset.current_transfer_authorization != null)
                {
                    alert("That asset is already authorized for transfer.")
                    return;
                }

                $("#newTransferAuthorizationAssetId").val(asset.id);
                $("#newTransferAuthorizationAssetIdDisplay").html(asset.id);

                $("#newTransferAuthorizationFromCustodianId").val(asset.last_transfer.toCustodianId);
                $("#newTransferAuthorizationFromCustodianIdDisplay").html(asset.last_transfer.toCustodianId);

                // Refresh the options for Custodian dropdown //
                tools.getFromAPI("custodians")
                    .then(function (data) {
                        state.custodians = data;

                        $("#newTransferAuthorizationToCustodianId").html($("<option/>"));

                        for (var i = 0; i < state.custodians.length; i++)        
                        {
                            if (state.custodians[i].id == asset.last_transfer.toCustodianId)
                                continue;

                            var custodian_name = "";
                            if (state.custodians[i].current_external_data != null && 
                                typeof state.custodians[i].current_external_data.data !== "undefined" && 
                                typeof state.custodians[i].current_external_data.data.name !== "undefined")

                                custodian_name = " - " + state.custodians[i].current_external_data.data.name;

                            $("#newTransferAuthorizationToCustodianId").append($("<option/>").attr("value", state.custodians[i].id).html(state.custodians[i].id + " - " + state.custodians[i].type + custodian_name));
                        }
                        
                        $("#modal-authorize-asset-transfer").modal();    
                    })        
            })

        
    })

    $("#frm-authorize-asset-transfer").submit(function (e) {
        e.preventDefault();

        $("#frm-authorize-asset-transfer button").attr("disabled", "disabled").button('refresh');
        $("#frm-authorize-asset-transfer .spinner-grow").removeClass("invisible");

        var assetTransferAuthorizationObj = {	
            "asset_transfer_authorization": {
                "assetId": $("#newTransferAuthorizationAssetId").val()
            }
        }

        if ($("#newTransferAuthorizationToCustodianId").val() != "")        
            assetTransferAuthorizationObj.asset_transfer_authorization.toCustodianId = $("#newTransferAuthorizationToCustodianId").val()
        

        tools.postToAPI("assets/authorize-transfer", assetTransferAuthorizationObj, $("#newTransferAuthorizationFromCustodianId").val())
            .then(function (requestTxnData) {
                console.log(requestTxnData);
            })
            .finally(function () {
                // Sleep long enough for block to be written, then close modal and refresh the custodian view //
                sleep(6000)
                    .then(function () {                                                
                        $("#modal-authorize-asset-transfer").modal("hide");

                        $("#frm-authorize-asset-transfer").trigger("reset");

                        $("#frm-authorize-asset-transfer button").removeAttr("disabled").button('refresh');
                        $("#frm-authorize-asset-transfer .spinner-grow").addClass("invisible");

                        tools.setView({view: "assets"});
                    })
            });

        
    })

    $(document).on("click", ".load-accept-transfer-modal", function () {        

        tools.getFromAPI("assets/" + $(this).attr("data-id"))
            .then(function (asset) {

                if (asset.current_transfer_authorization == null)
                {
                    alert("That asset is not authorized for transfer.")
                    return;
                }

                $("#newAssetTransferAssetId").val(asset.id);
                $("#newAssetTransferAssetIdDisplay").html(asset.id);

                $("#newAssetTransferFromCustodianId").val(asset.last_transfer.toCustodianId);
                $("#newAssetTransferFromCustodianIdDisplay").html(asset.last_transfer.toCustodianId);

                // Refresh the options for Custodian dropdown //
                tools.getFromAPI("custodians")
                    .then(function (data) {
                        state.custodians = data;

                        $("#newAssetTransferToCustodianId").html($("<option/>"));

                        for (var i = 0; i < state.custodians.length; i++)        
                        {
                            if (state.custodians[i].id == asset.last_transfer.toCustodianId)
                                continue;

                            var custodian_name = "";
                            if (state.custodians[i].current_external_data != null && 
                                typeof state.custodians[i].current_external_data.data !== "undefined" && 
                                typeof state.custodians[i].current_external_data.data.name !== "undefined")

                                custodian_name = " - " + state.custodians[i].current_external_data.data.name;

                            $("#newAssetTransferToCustodianId").append($("<option/>").attr("value", state.custodians[i].id).html(state.custodians[i].id + " - " + state.custodians[i].type + custodian_name));
                        }
                        
                        $("#modal-accept-asset-transfer").modal();    
                    })        
            })

        
    })

    $("#frm-accept-asset-transfer").submit(function (e) {
        e.preventDefault();

        if ($("#newAssetTransferToCustodianId").val() == "")      
        {  
            alert("Receiving custodian is required")
            return false;
        }

        $("#frm-accept-asset-transfer button").attr("disabled", "disabled").button('refresh');
        $("#frm-accept-asset-transfer .spinner-grow").removeClass("invisible");

        var assetTransferObj = {	
            "asset_transfer": {
                "assetId": $("#newAssetTransferAssetId").val()
            }
        }

        tools.postToAPI("assets/transfer", assetTransferObj, $("#newAssetTransferToCustodianId").val())
            .then(function (requestTxnData) {
                console.log(requestTxnData);
            })
            .finally(function () {
                // Sleep long enough for block to be written, then close modal and refresh the custodian view //
                sleep(6000)
                    .then(function () {                                                
                        $("#modal-accept-asset-transfer").modal("hide");

                        $("#frm-accept-asset-transfer").trigger("reset");

                        $("#frm-accept-asset-transfer button").removeAttr("disabled").button('refresh');
                        $("#frm-accept-asset-transfer .spinner-grow").addClass("invisible");

                        tools.setView({view: "assets"});
                    })
            });

        
    })
})