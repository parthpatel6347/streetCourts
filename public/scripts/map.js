// jshint esversion:9


mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10', // stylesheet location
    center: foundCourt.geometry.coordinates, // starting position [lng, lat]
    zoom: 7 // starting zoom
});



const marker = new mapboxgl.Marker()
    .setLngLat(foundCourt.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({closeButton:false})
        .setHTML(
            `<h6>${foundCourt.title}</h6><p>${foundCourt.location}</p>`
        )
    )
    .addTo(map);

    var nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'top-right');