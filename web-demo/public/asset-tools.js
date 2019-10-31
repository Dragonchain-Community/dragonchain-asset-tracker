var authorityCustodianId = "e2634eb5-b462-41f2-8d35-99f25f8cbbd0";

var state = {
    currentAuthenticatedCustodianId: authorityCustodianId,
    custodians: null,
    assetGroups: null,
    assets: null
} 

var tools = {
    setView: async (options) => {

        if (options.view == "custodians")
        {
            $("#current-view-title").text("Custodians")

            $("#current-view-content").html($("#loading").html())

            var custodians = await tools.getCustodians();

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
                            .append($("<td/>").text(typeof item.current_external_data.data !== "undefined" ? item.current_external_data.data.name : "N/A"))
                            .append($("<td/>").text(typeof item.current_external_data.data !== "undefined" ? item.current_external_data.data.description : "N/A"))
                            .append($("<td/>")
                                .append(
                                    item.assets.length > 0 ? $("<button/>").addClass("btn btn-primary set-view").attr("rel", "custodian-assets").attr("data-id", item.id).html("View Assets <span class='badge badge-light'>" + item.assets.length + "</span>") : $("<span/>").text("N/A")
                                )
                            )
                    )
                })

                $("#current-view-content").html(table);
            }
            
        }

        if (options.view == "asset-groups")
        {
            $("#current-view-title").text("Asset Groups")

            $("#current-view-content").html($("#loading").html())

            var assetGroups = await tools.getAssetGroups();

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
                                        )
                                )


                $.each (assetGroups, function (index, item) {
                    table.append(
                        $("<tr/>")                            
                            .append($("<td/>").html(item.id  + ' <a href="#" class="badge badge-success load-modal-view" rel="object-verifications" data-id="' + item.id +'">Verifications</a>'))  
                            .append($("<td/>").text(item.name))
                            .append($("<td/>").text(item.description))
                            
                    )
                })

                $("#current-view-content").html(table);
            }
        }

        if (options.view == "assets")
        {
            $("#current-view-title").text("Assets")

            $("#current-view-content").html($("#loading").html())

            var assets = await tools.getAssets();

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
                    table.append(
                        $("<tr/>")                            
                            .append($("<td/>").html(item.id  + ' <a href="#" class="badge badge-success load-modal-view" rel="object-verifications" data-id="' + item.id +'">Verifications</a>'))                            
                            .append($("<td/>").text(typeof item.current_external_data.id !== "undefined" ? item.current_external_data.id : "N/A"))
                            .append($("<td/>").text(typeof item.current_external_data.data !== "undefined" ? item.current_external_data.data.name : "N/A"))
                            .append($("<td/>").text(typeof item.current_external_data.data !== "undefined" ? item.current_external_data.data.description : "N/A"))
                            .append($("<td/>")
                                .append(
                                    $("<button/>").addClass("btn btn-primary load-modal-view").attr("rel", "asset-details").attr("data-id", item.id).html("View Details")
                                )
                            )
                    )
                })

                $("#current-view-content").html(table);
            }
        }
        
        if (options.view == "custodian-assets")
        {
            $("#current-view-title").text("Custodian Assets")

            $("#current-view-content").html($("#loading").html())

            var custodian = await tools.getCustodian(options.id);

            $("#current-view-title").text("Custodian Assets for " + custodian.id + " (" + custodian.type + ")")

            var assets = await tools.getCustodianAssets(options.id);

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
                    table.append(
                        $("<tr/>")                            
                            .append($("<td/>").html(item.id  + ' <a href="#" class="badge badge-success load-modal-view" rel="object-verifications" data-id="' + item.id +'">Verifications</a>'))                            
                            .append($("<td/>").text(typeof item.current_external_data.id !== "undefined" ? item.current_external_data.id : "N/A"))
                            .append($("<td/>").text(typeof item.current_external_data.data !== "undefined" ? item.current_external_data.data.name : "N/A"))
                            .append($("<td/>").text(typeof item.current_external_data.data !== "undefined" ? item.current_external_data.data.description : "N/A"))
                            .append($("<td/>")
                                .append(
                                    $("<button/>").addClass("btn btn-primary load-modal-view").attr("rel", "asset-details").attr("data-id", item.id).html("View Details")
                                )
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

            var asset = await tools.getAsset(options.id);

            console.log (asset);

            if (typeof asset !== "undefined")
            {
                var div = $("<div/>").addClass("row");

                if (typeof asset.current_external_data.data.image_url != "undefined")
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
        
        if (options.view == "object-verifications")
        {
            $("#modal .modal-title").text("Dragon Net Object Verifications")

            $("#modal .modal-body .container-fluid").html($("#loading").html())

            $("#modal").modal();

            var verifications = await tools.getObjectVerifications(options.id);

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

    getCustodians: async () => {        
        return $.ajax(
            "http://127.0.0.1:3030/custodians/",
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
                console.error(error.responseJSON.message)
            })
            
    },

    getCustodian: async (objectId) => {        
        return $.ajax(
            "http://127.0.0.1:3030/custodians/" + objectId,
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
                console.error(error.responseJSON.message)
            })
            
    },

    getCustodianAssets: async (objectId) => {        
        return $.ajax(
            "http://127.0.0.1:3030/custodian/assets/" + objectId,
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
                console.error(error.responseJSON.message)
            })
            
    },

    getAssetGroups: async () => {        
        return $.ajax(
            "http://127.0.0.1:3030/asset-groups/",
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
                console.error(error.responseJSON.message)
            })
            
    },

    getAssets: async () => {        
        return $.ajax(
            "http://127.0.0.1:3030/assets/",
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
                console.error(error.responseJSON.message)
            })
            
    },

    getAsset: async (objectId) => {        
        return $.ajax(
            "http://127.0.0.1:3030/assets/" + objectId,
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
                console.error(error.responseJSON.message)
            })
            
    },

    getObjectVerifications: async (objectId) => {        
        return $.ajax(
            "http://127.0.0.1:3030/verifications/" + objectId,
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
                console.error(error.responseJSON.message)
            })
            
    }
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
})