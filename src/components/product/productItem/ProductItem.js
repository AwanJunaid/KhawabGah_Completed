// ProductItem.jsx
import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { ADD_TO_CART, CALCULATE_TOTAL_QUANTITY } from "../../../redux/slice/cartSlice";
import Card from "../../card/Card";
import styles from "./ProductItem.module.scss";
import Slidar from "../slider/slider";



const ProductItem = ({ product, grid, id, name, price, desc, imageURLs }) => {
  const dispatch = useDispatch();

  const shortenText = (text, n) => {
    if (text.length > n) {
      const shortenedText = text.substring(0, n).concat("...");
      return shortenedText;
    }
    return text;
  };

  const addToCart = (product) => {
    dispatch(ADD_TO_CART(product));
    dispatch(CALCULATE_TOTAL_QUANTITY());
  };

  // Slick carousel settings with custom arrows

  return (
    <Card cardClass={grid ? `${styles.grid}` : `${styles.list}`}>
      <Link to={`/product-details/${id}`}>
      <div className={styles.img}>
          <Slidar images={imageURLs} />
        </div>
      </Link>
      <div className={styles.content}>
        <div className={styles.details}>
          <p>{`PKR${price}`}</p>
          <h4>{shortenText(name, 18)}</h4>
        </div>
        {!grid && <p className={styles.desc}>{shortenText(desc, 200)}</p>}

        <button
          className="--btn --btn-danger"
          onClick={() => addToCart(product)}
        >
          Add To Cart
        </button>
      </div>
    </Card>
  );
};

export default ProductItem;
