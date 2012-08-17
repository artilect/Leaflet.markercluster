L.MarkerClusterGroup.DefaultClusterer = function (cellSize) {
	this._cellSize = cellSize;
};

L.MarkerClusterGroup.DefaultClusterer.prototype = {

	//Takes a list of objects that have a 'getLatLng()' function (Marker / MarkerCluster)
	//Performs clustering on them (using a greedy algorithm) and returns those clusters.
	//markers: List of Markers/MarkerClusters to cluster
	//Returns { 'clusters': [new clusters], 'unclustered': [unclustered markers] }
	performClustering: function (clusterGroup, markers, zoom) {
		var radius = this._cellSize,
		    clusters = new L.DistanceGrid(radius),
		    unclustered = new L.DistanceGrid(radius),
		    i, marker, markerPoint, cluster, newCluster;

		// go through each point
		for (i = markers.length - 1; i >= 0; i--) {
			marker = markers[i];
			markerPoint = clusterGroup._map.project(marker.getLatLng(), zoom); // calculate pixel position

			// try add it to an existing cluster
			cluster = clusters.getNearObject(markerPoint);

			if (cluster) {
				cluster._addChild(marker);
			} else {
				// otherwise, look through all of the markers we haven't managed to cluster and see if we should form a cluster with them
				newCluster = this._clusterOne(clusterGroup, unclustered, marker, markerPoint);
				if (newCluster) {
					clusters.addObject(newCluster, clusterGroup._map.project(newCluster.getLatLng(), zoom));
				} else {
					// didn't manage to use it
					unclustered.addObject(marker, markerPoint);
				}
			}
		}

		var result = [],
			group = clusterGroup;

		// any clusters that did not end up being a child of a new cluster, make them a child of a new cluster
		unclustered.eachObject(function (cluster) {
			if (cluster instanceof L.MarkerCluster) {
				newCluster = new L.MarkerCluster(group, cluster);
				newCluster._haveGeneratedChildClusters = true;

				clusters.addObject(newCluster, cluster._dGridPoint);
				unclustered.removeObject(cluster);

				return true;
			}
			return false;
		});

		unclustered.eachObject(function (marker) {
			result.push(marker);
		});

		// initialize created clusters
		clusters.eachObject(function (cluster) {
			cluster._baseInit();
			result.push(cluster);
		});

		return result;
	},

	//Takes a list of markers and clusters the new marker in to them
	//Will return null or the new MarkerCluster. The clustered in marker is removed from the given array
	_clusterOne: function (clusterGroup, unclustered, newMarker, markerPoint) {
		var marker = unclustered.getNearObject(markerPoint);

		if (marker) {
			// create a new cluster with these 2
			unclustered.removeObject(marker);
			return new L.MarkerCluster(clusterGroup, marker, newMarker);
		}

		return null;
	}
};