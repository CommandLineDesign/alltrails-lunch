import React, { Component } from "react";
import StarRatings from "react-star-ratings";
import "./style.css";
import Favorite from "rmdi/lib/Favorite";
import FavoriteBorder from "rmdi/lib/FavoriteBorder";
export default class Card extends Component {
  render() {
    let priceLevel = "$";
    if (this.props.data && this.props.data.price_level) {
      for (var i = 2; i < this.props.data.price_level; i++) {
        priceLevel = priceLevel + "$";
      }
    }

    let favoriteContent = (
      <FavoriteBorder
        onClick={() => this.props.toggleFavorite(this.props.data.id)}
      />
    );

    if (
      this.props.favorites &&
      this.props.favorites[this.props.data.id] === true
    ) {
      favoriteContent = (
        <Favorite
          onClick={() => this.props.toggleFavorite(this.props.data.id)}
        />
      );
    }

    return (
      <div
        className={
          "card-container " + (this.props.highlight === true ? "highlight" : "")
        }
      >
        <div className="card-col card-icon">
          <img
            height="60px"
            width="60px"
            src={this.props.data.photos[0].getUrl()}
          />
        </div>
        <div className="card-col card-text">
          <div className="card-title">{this.props.data.name}</div>
          <div className="card-rating">
            <StarRatings
              rating={this.props.data.rating}
              starRatedColor="#f3d153"
              numberOfStars={5}
              starDimension="13px"
              starSpacing="1px"
              name="rating"
            />
            <span className="card-ratings-total">
              ({this.props.data.user_ratings_total})
            </span>
          </div>
          <div className="card-footer">
            <span className="card-item card-priceLevel">{priceLevel}</span>
            <span className="card-item card-address">supporting text</span>
          </div>
        </div>
        <div
          className={
            "card-col favorite " +
            (this.props.favorites &&
            this.props.favorites[this.props.data.id] === true
              ? "highlight"
              : "")
          }
        >
          {favoriteContent}
        </div>
      </div>
    );
  }
}
