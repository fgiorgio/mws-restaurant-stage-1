let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
    DBHelper.fetchReviewsByRestaurantId(id, (error, reviews) => {
        if (!reviews) {
            console.error(error);
            return;
        }
        fillReviewsHTML(reviews);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const imgUrl = DBHelper.imageUrlForRestaurant(restaurant);
  if(imgUrl){
    const imgSourceWebp = document.getElementById('restaurant-img-source-webp');
    imgSourceWebp.srcset = imgUrl+'_small.webp 400w, '+imgUrl+'.webp 800w';
    const imgSource = document.getElementById('restaurant-img-source');
    imgSource.srcset = imgUrl+'_small.jpg 400w, '+imgUrl+'.jpg 800w';
    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    image.title = restaurant.name+' Restaurant';
    image.alt = restaurant.name+' Restaurant';
    image.src = imgUrl+'.jpg';
  }

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  //fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('th');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  title.tabIndex = '0';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.tabIndex = '0';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const div = document.createElement('div');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.tabIndex = '0';
  li.appendChild(div);
  div.appendChild(name);

  const date = document.createElement('p');
  let dateObj = new Date();
  if(review.updatedAt){
      dateObj = new Date(review.updatedAt);
  }
  date.innerHTML = dateObj.getDate()+'-'+(dateObj.getMonth()+1)+'-'+dateObj.getFullYear();
  date.tabIndex = '0';
  div.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.tabIndex = '0';
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.tabIndex = '0';
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.tabIndex = '0';
  li.setAttribute('aria-current','page');
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Add a new review for a restaurant
 */
addReview = ()=>{
  let offlineReview = JSON.stringify({
      restaurant_id: self.restaurant.id,
      name: document.getElementById('name').value,
      rating: parseInt(document.getElementById('rating').value),
      comments: document.getElementById('comments').value,
  });
  if(navigator.onLine) {
      DBHelper.addReview(offlineReview, (error, review) => {
          if (!review) {
              alert('Impossible to add the review! Try later.');
              return;
          }
          document.getElementById('reviews-list').appendChild(createReviewHTML(review));
          document.getElementById('name').value = '';
          document.getElementById('rating').value = '';
          document.getElementById('comments').value = '';
      });
  }else{
      document.getElementById('reviews-list').appendChild(createReviewHTML(JSON.parse(offlineReview)));
      document.getElementById('name').value = '';
      document.getElementById('rating').value = '';
      document.getElementById('comments').value = '';
      window.addEventListener('online',function (event) {
          DBHelper.addReview(offlineReview,(error, review) => {
              if (!review) {
                  alert('Impossible to add the review! Try later.');
                  return;
              }
          });
      });
  }

};