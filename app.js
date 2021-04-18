function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie =
        name +
        "=" +
        (value || "") +
        expires +
        "; path=/perimeter-map;domain=remialban.github.io";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

$(document).ready(function() {

    var acceptCookieBtn = $("#buttonAcceptCookie")
    var clearAddressInputBtn = $("#clearButton")
    var addressInput = $("#address-input")
    var listAddresses = $("#list")

    var mymap = L.map("mapid");

    L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: "mapbox/streets-v11",
            tileSize: 512,
            zoomOffset: -1,
            accessToken: "pk.eyJ1IjoicmVtaWFsYmFuODEiLCJhIjoiY2tuZGxkMng2MWlmMTJ2bXJtb3BmMTF3OSJ9.2ElAN4jWXxxMaLIhXyxV-Q",
        }
    ).addTo(mymap);

    var circle = L.circle([0, 0], {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.5,
        radius: 10000,
    }).addTo(mymap);
    var marker = L.marker([0, 0]).addTo(mymap);

    acceptCookieBtn.click(() => {
        setCookie("cookie_accepted", "true", 99999);
    });

    if (getCookie("cookie_accepted") != "true") {
        var myModal = new bootstrap.Modal(document.getElementById("modalCookie"));
        myModal.show();
    }

    // $("#toastCookie").toast("show");
    function api() {
        console.log(addressInput.val())
        fetch(
            "https://api-adresse.data.gouv.fr/search/?q=" + addressInput.val()
        ).then((response) => {
            if (response.ok) {
                response.json().then((data) => {
                    addresses = data.features;
                    listAddresses.empty();
                    addresses.map((address) => {
                        listAddresses.append(
                            "<a href='#' class='list-group-item list-group-item-action item_address' data-latitude='" +
                            address.geometry.coordinates[0] +
                            "'' data-longitude='" +
                            address.geometry.coordinates[1] +
                            "'>" +
                            address.properties.label +
                            "</a>"
                        );
                    });
                });
            }
        });
    }
    $(document).on("click", ".item_address", function() {
        var element = $(this);
        addressInput.val(element.text());
        listAddresses.empty();
        mise_a_jour_map(
            element.data("longitude"),
            element.data("latitude"),
            element.text()
        );
    });

    clearAddressInputBtn.click(() => {
        addressInput.val("");
    });

    addressInput.on("input", function() {
        api();
    });

    function mise_a_jour_map(long, lat, address) {
        marker.setLatLng([long, lat]);
        circle.setLatLng([long, lat]);
        mymap.setView([long, lat], 11);

        if (address != null) {
            $("#address-input").val(address);
            setCookie("longitude", long, 99999);
            setCookie("latitude", lat, 99999);
            setCookie("address", address, 99999);
            marker.bindPopup(address);
        }
    }

    function onLocationFound(e) {
        mise_a_jour_map(e.latitude, e.longitude, null);
    }
    if (getCookie("longitude") == null) {
        mise_a_jour_map(48.856614, 2.3522219);
        mymap.locate({
            setView: true,
            maxZoom: 18,
        });
        mymap.on("locationfound", onLocationFound);
    } else {
        mise_a_jour_map(
            getCookie("longitude"),
            getCookie("latitude"),
            getCookie("address")
        );
    }
    $("body").click(() => {
        listAddresses.empty();
    });
});