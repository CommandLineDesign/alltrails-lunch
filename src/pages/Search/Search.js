/*global google*/
import React from "react";
import {
  compose,
  withProps,
  lifecycle,
  withHandlers,
  withStateHandlers,
  withState
} from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  InfoWindow
} from "react-google-maps";
import "./style.css";
import MediaQuery from "react-responsive";
import CardTray from "../../components/CardTray/index.js";
import Card from "../../components/Card/index.js";
import StandaloneSearchBox from "react-google-maps/lib/components/places/StandaloneSearchBox";
import logo from "../../assets/images/logo.png";
import mapIcon from "../../assets/images/mapIcon.png";
import FormatListBulleted from "rmdi/lib/FormatListBulleted";
import LocationOn from "rmdi/lib/LocationOn";
const _ = require("lodash");
const {
  SearchBox
} = require("react-google-maps/lib/components/places/SearchBox");

const MapWithASearchBox = compose(
  withProps({
    googleMapURL:
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyDpEr8NpgU_ERTJw6tm1nmGrpUZozM-oQE&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: (
      <div
        className="maps-container"
        style={{
          width: "-webkit-fill-available",
          height: `569px`
        }}
      />
    ),
    mapElement: <div className="maps-element" />
  }),
  lifecycle({
    componentWillMount() {
      const refs = {};

      this.setState({
        bounds: null,
        type: ["restaurant"],
        center: { lat: 37.8074448, lng: -122.4243621 },
        markers: [],
        onMapMounted: ref => {
          refs.map = ref;
        },
        onBoundsChanged: () => {
          this.setState({
            bounds: refs.map.getBounds(),
            center: refs.map.getCenter()
          });
        },
        onSearchBoxMounted: ref => {
          refs.searchBox = ref;
        },
        onPlacesChanged: () => {
          const places = refs.searchBox.getPlaces();
          const bounds = new google.maps.LatLngBounds();

          places.forEach(place => {
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          const nextMarkers = places.map(place => ({
            position: place.geometry.location
          }));
          const nextCenter = _.get(
            nextMarkers,
            "0.position",
            this.state.center
          );

          this.setState({
            center: nextCenter,
            markers: nextMarkers
          });
        }
      });
    }
  }),
  withState("places", "updatePlaces", ""),
  withStateHandlers(
    () => ({
      isOpen: false,
      markerIndex: 0
    }),

    {
      onToggleOpen: ({ isOpen }) => index => ({
        isOpen: !isOpen,
        markerIndex: index
      })
    }
  ),
  withHandlers(props => {
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
            updatePlaces(results);
            props.updatePlacesList(results);
          }
        });
      }
    };
  }),
  withScriptjs,
  withGoogleMap
)(props => (
  <div>
    <div>
      <StandaloneSearchBox
        ref={props.onSearchBoxMounted}
        bounds={props.bounds}
        onPlacesChanged={props.onPlacesChanged}
      >
        <input
          type="text"
          placeholder="Search for a restaurant"
          className="search-searchBox"
        />
      </StandaloneSearchBox>
    </div>
    <div>
      <GoogleMap
        ref={props.onMapMounted}
        defaultZoom={15}
        center={props.center}
        onTilesLoaded={props.fetchPlaces}
        onBoundsChanged={props.fetchPlaces}
        defaultOptions={{
          scaleControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: false,
          streetViewControl: false
        }}
      >
        {props.places &&
          props.places.map((place, index) => (
            <Marker
              onClick={() => {
                props.onToggleOpen(index);
              }}
              onMouseOver={() => {
                props.togglePlaceHighlight(index);
              }}
              options={{ icon: mapIcon }}
              key={index}
              position={{
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              }}
            >
              {props.isOpen && props.markerIndex === index && (
                <InfoWindow onCloseClick={props.onToggleOpen}>
                  <div className="search-infoWindow-card">
                    <Card data={place} />
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
      </GoogleMap>
    </div>
  </div>
));

export default class Search extends React.Component {
  constructor() {
    super();
    this.state = {
      restaurantList: [],
      listShown: false,
      sortDropdownShown: false,
      highlightedPlace: false,
      favoritePlaces: {}
    };
  }

  componentDidMount() {
    this.setState({
      map: "loaded"
    });
  }

  updatePlacesList = places => {
    this.setState({ restaurantList: places });
  };

  toggleFavorite = placeId => {
    let favoritePlaces = this.state.favoritePlaces;
    if (!favoritePlaces[placeId]) {
      favoritePlaces[placeId] = true;
    } else {
      favoritePlaces[placeId] = false;
    }
    this.setState({ favoritePlaces: favoritePlaces });
  };

  togglePlaceHighlight = index => {
    this.setState({ highlightedPlace: index });
  };

  toggleMobileContent = () => {
    if (!this.state.listShown) {
      this.setState({ listShown: true });
    } else {
      this.setState({ listShown: false });
    }
  };

  toggleSortDropdown = () => {
    if (!this.state.sortDropdownShown) {
      this.setState({ sortDropdownShown: true });
    } else {
      this.setState({ sortDropdownShown: false });
    }
  };

  render() {
    let toggleViewButtonContent = (
      <span>
        <span className="icon">
          <FormatListBulleted />
        </span>
        <span className="label">List</span>
      </span>
    );

    if (this.state.listShown) {
      toggleViewButtonContent = (
        <span>
          <span className="icon-location">
            <LocationOn />
          </span>
          <span className="label">Map</span>
        </span>
      );
    }

    return (
      <div className="search-container">
        <MediaQuery minWidth={800}>
          <div className="nav">
            <div className="logo-container">
              <span>
                <img className="logo" src={logo} />
              </span>
            </div>
            <span className="search-filter-button-wrapper">
              <span
                className="search-filter-button-text"
                onClick={this.toggleSortDropdown}
              >
                Filter
              </span>
            </span>
          </div>
          <div className="search-content-container row">
            <div className="search-list">
              <CardTray
                favorites={this.state.favoritePlaces}
                toggleFavorite={this.toggleFavorite}
                highlightedPlace={this.state.highlightedPlace}
                restaurantList={this.state.restaurantList}
              />
            </div>
            <div className="search-map">
              <MapWithASearchBox
                updatePlacesList={this.updatePlacesList}
                togglePlaceHighlight={this.togglePlaceHighlight}
              />
              <div>
                {" "}
                {this.state.sortDropdownShown ? (
                  <div className="search-sortDropdown-wrapper">
                    <div className="search-sortDropdown">
                      <ul>
                        <li>
                          <input
                            className="search-sortDropdown-radio"
                            type="radio"
                          />
                          <span className="search-sortDropdown-text">
                            Ratings High to Low
                          </span>
                        </li>
                        <li>
                          <input
                            className="search-sortDropdown-radio"
                            type="radio"
                          />
                          <span className="search-sortDropdown-text">
                            Ratings Low to High
                          </span>
                        </li>
                      </ul>
                      <div className="search-applyButton-wrapper">
                        <span className="search-applyButton-text">Apply</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </MediaQuery>
        <MediaQuery maxWidth={800}>
          <div id="mobile-search">
            <div className="mobile-nav">
              <div className="mobile-logo-container">
                <div>
                  <span>
                    <img className="logo" src={logo} />
                  </span>
                </div>
                <div className="search-filter-button-wrapper">
                  <span
                    className="search-filter-button-text"
                    onClick={this.toggleSortDropdown}
                  >
                    Filter
                  </span>
                  <span className="mobile-search-searchBox-container">
                    {" "}
                    <input
                      type="text"
                      placeholder="Search for a restaurant"
                      className={
                        "mobile-list-searchBox " +
                        (this.state.listShown === false ? "hidden" : "")
                      }
                    />
                  </span>
                </div>
              </div>
            </div>
            <div
              className={
                "mobile-search-map " +
                (this.state.listShown === true ? "hidden" : "")
              }
            >
              <MapWithASearchBox
                height="812px"
                togglePlaceHighlight={this.togglePlaceHighlight}
                updatePlacesList={this.updatePlacesList}
              />
            </div>
            <div
              className={
                "mobile-search-list " +
                (this.state.listShown === false ? "hidden" : "")
              }
            >
              <CardTray
                favorites={this.state.favoritePlaces}
                toggleFavorite={this.toggleFavorite}
                restaurantList={this.state.restaurantList}
                highlightedPlace={this.state.highlightedPlace}
              />
            </div>
            <div
              className="mobile-search-toggleView-wrapper"
              onClick={this.toggleMobileContent}
            >
              <span className="mobile-search-toggleView-content">
                {toggleViewButtonContent}
              </span>
            </div>
          </div>
        </MediaQuery>
      </div>
    );
  }
}
