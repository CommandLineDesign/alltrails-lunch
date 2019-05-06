import React, { Component } from "react";
import "./style.css";
import Card from "../Card/index.js";
export default class CardTray extends Component {
  render() {
    return (
      <div className="cardTray-container">
        {this.props.restaurantList.map((place, index) => (
          <Card
            data={place}
            favorites={this.props.favorites}
            toggleFavorite={this.props.toggleFavorite}
            highlight={this.props.highlightedPlace === index ? true : false}
          />
        ))}
      </div>
    );
  }
}
