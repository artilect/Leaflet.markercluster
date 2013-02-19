L.MarkerClusterGroup.TestClusterer = function (cellSize) {
};

L.MarkerClusterGroup.TestClusterer.prototype = {

	//Takes a list of objects that have a 'getLatLng()' function (Marker / MarkerCluster)
	//Performs clustering on them (using a greedy algorithm) and returns those clusters.
	//markers: List of Markers/MarkerClusters to cluster
	//Returns { 'clusters': [new clusters], 'unclustered': [unclustered markers] }
	performClustering: function (clusterGroup, markers, zoom) {
		var result = [];
		// initialize created clusters
		var first = new L.MarkerCluster(clusterGroup, markers[0]);

		result.push(first);


		for (var i = 1; i < 2 /*markers.length*/; i++) {
			var mc = new L.MarkerCluster(clusterGroup, markers[i], first);
//			first.addChild();
//			result.push(mc);
//			mc._baseInit();
//			first._addChild(mc);
		}

		first._baseInit();
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