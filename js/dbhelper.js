/**
 * Common database helper functions.
 */
class DBHelper {

  static IDBOpen(){
    return idb.open('mws-restaurant-stage', 1, function(upgradeDB) {
      switch (upgradeDB.oldVersion) {
        case 0:
          upgradeDB.createObjectStore('restaurant-reviews', {keyPath: 'id'});
      }
    });
  }

  /**
   * Update data into IndexedDB.
   */
  static updateIDB(data) {
    DBHelper.IDBOpen()
      .then(function(db){
        let tx = db.transaction('restaurant-reviews', 'readwrite');
        let objStore = tx.objectStore('restaurant-reviews');
        if(data.length){
          objStore.clear();
          data.map(function (obj) {
            objStore.put(obj);
          });
        }else{
          objStore.put(data);
        }
        tx.complete
          .catch(()=>console.log('IndexedDB error during update!'))
      });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    DBHelper.IDBOpen()
      .then(function(db){
        let tx = db.transaction('restaurant-reviews', 'readonly');
        let objStore = tx.objectStore('restaurant-reviews');
        return objStore.getAll();
      }).then(function (data) {
        if(data.length){
          callback(null, data);
        }else{
          fetch(`http://localhost:1337/restaurants`)
            .then((response)=>response.json())
            .then((data)=>{
              DBHelper.updateIDB(data);
              return callback(null, data);
            })
            .catch((error)=>callback(error, null));
        }
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find((r) => r.id == id);
        if (restaurant) {
          callback(null, restaurant);
        } else {
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(typeof restaurant.photograph !== 'undefined') {
      return (`/img/${restaurant.photograph}`);
    }else{
      return null;
    }
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
