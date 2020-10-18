mapboxgl.accessToken = 'pk.eyJ1IjoiYWRoYW1raGFsaWZhIiwiYSI6ImNrZWY0emw4NTBnNDAyeG16dnpsdHdpbmsifQ.8B2eBNqORCjd_D2mTqK1UA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/adhamkhalifa/ckb8ny4yb07i01ik15ve80y40',
    center: [-122.447303, 37.753574],
    zoom: 8,
});

// Add geolocate control to the map.
map.addControl(
    new mapboxgl.GeolocateControl({
    positionOptions: {
    enableHighAccuracy: true
    },
    trackUserLocation: true
    })
    );

// Get places from API
async function getPlaces() {
    const res = await fetch('/api');
    const data = await res.json();
    let places = data.data.map(place => (
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [place.location.coordinates[0], place.location.coordinates[1]]
            },
            properties: {
                description:"<br><b>Name: </b>" + place.fullName.split(" ",)[0] + "<br><b>Phone: </b>"+ place.phoneNumber
            }
        }
    ));
    return places;
};

// Show places on map
async function showMap() {
    let places = await getPlaces();
    map.on('load', () => {
        map.addSource('api', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: places
            }
        });
        map.addLayer({
            id: 'places',
            type: 'circle',
            minzoom: 0,
            source: 'api',
            layout: {
            },
            paint: {
                'circle-radius': 5,
                  'circle-color': "red"
            },
        });

        // When a click event occurs on a feature in the places layer, open a popup at the
// location of the feature, with description HTML from its properties.
    map.on('click', 'places', function(e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.description;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML(description)
    .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'places', function() {
    map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
map.on('mouseleave', 'places', function() {
    map.getCanvas().style.cursor = '';
    });

    });
};

    // Handle user input
    const form = document.getElementById('form');
    const place = document.getElementById('place');
    const city = document.getElementById('city');
    const state = document.getElementById('state');
    const zip = document.getElementById('zip');
    const addressName = document.getElementById('addressName');
    const fullName = document.getElementById('fullName');
    const gender = document.getElementById('gender');
    const age = document.getElementById('age');
    const phoneNumber = document.getElementById('phoneNumber');

function handleChange() {
    if (addressName.value === '') {
        addressName.style.border = '3px solid lightcoral';
    } else {
        addressName.style.border = 'none';
    }
}

// Send POST to API to add place
async function addPlace(e) {
    e.preventDefault();

    if (addressName.value === '') {
        addressName.placeholder = 'Please fill in an address';
        return;
    }

    const sendBody = {
        address: (zip.value + " " + state.value + " " + city.value + " " + addressName.value),
        fullName: fullName.value,
        gender: gender.value,
        age: age.value,
        phoneNumber: phoneNumber.value,
    };

    try {

        const res = await fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sendBody)
        });

        if (res.status === 400) {
            throw Error;
        }

        if (res.status === 200) {
            addressName.style.border = 'none';
                e.preventDefault();
            $('#myModal').modal('show');

            // Retrieve updated data
            places = await getPlaces();

            map.getSource('api').setData({
                type: 'FeatureCollection',
                features: places
            });
        }
    } catch (err) {
        $('#errorMessage').value = "Error adding information.";
        return;
    }
};

place.addEventListener('keyup', handleChange);
form.addEventListener('submit', addPlace);

// Render places
showMap();
