var authorityCustodianId = "b49f5461-e821-427a-a657-d32d01f53bce";

var state = {
    currentAuthenticatedCustodianId: authorityCustodianId,
    custodians: null,
    assetGroups: null,
    assets: null
} 

var tools = {
    getCustodians: () => {        
        $.ajax(
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
                
                $.each (data, function (index, item) {
                    $("#main-content").append(
                        $("<p/>")
                            .html(
                                JSON.stringify(item,null,2)
                            )
                    )
                })
            })
            .catch(function (error) {
                console.log(error.responseText)
            })
            
    }
}

$().ready(() => {
    tools.getCustodians();
})