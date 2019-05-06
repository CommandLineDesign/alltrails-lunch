/*global google*/
import React from "react";
import { compose, withProps, withHandlers, withState } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from "react-google-maps";
import CardTray from "../../components/CardTray/index.js";

const MyMapComponent = compose(
  withProps({
    googleMapURL:
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyDpEr8NpgU_ERTJw6tm1nmGrpUZozM-oQE&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `500px` }} />,
    mapElement: <div style={{ height: `100%` }} />
  }),
  withScriptjs,
  withGoogleMap,
  withState("places", "updatePlaces", ""),
  withHandlers(() => {
    const refs = {
      map: undefined
    };

    return {
      onMapMounted: () => ref => {
        refs.map = ref;
      },
      fetchPlaces: ({ updatePlaces }) => {
        let places;
        const bounds = refs.map.getBounds();
        const service = new google.maps.places.PlacesService(
          refs.map.context.__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
        );
        const request = {
          bounds: bounds,
          type: ["restaurant"]
        };
        service.nearbySearch(request, (results, status) => {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log(results);
            updatePlaces(results);
          }
        });
      }
    };
  })
)(props => {
  return (
    <div>
      <div>
        {props.places &&
          props.places.map((place, index) => <div>{place.name}</div>)}
      </div>
      <div>
        <GoogleMap
          onTilesLoaded={props.fetchPlaces}
          ref={props.onMapMounted}
          onBoundsChanged={props.fetchPlaces}
          defaultZoom={14}
          defaultCenter={{ lat: 37.8074448, lng: -122.4243621 }}
        >
          {props.places &&
            props.places.map((place, i) => (
              <Marker
                onMouseDown={() => handleClick(place)}
                key={i}
                position={{
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }}
              />
            ))}
        </GoogleMap>
      </div>
    </div>
  );
});

const handleClick = function(place) {
  console.log(place);
};

export default class Search extends React.Component {
  constructor() {
    super();
    this.state = {
      map: "not loaded"
    };
  }

  componentDidMount() {
    this.setState({
      map: "loaded"
    });
  }

  render() {
    return (
      <div>
        <h1>search page!</h1>
        <CardTray cards="5" />
        <MyMapComponent />
      </div>
    );
  }
}
