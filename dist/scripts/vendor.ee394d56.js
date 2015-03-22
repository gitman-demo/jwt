!function(a,b){L.MarkerClusterGroup=L.FeatureGroup.extend({options:{maxClusterRadius:80,iconCreateFunction:null,spiderfyOnMaxZoom:!0,showCoverageOnHover:!0,zoomToBoundsOnClick:!0,singleMarkerMode:!1,disableClusteringAtZoom:null,removeOutsideVisibleBounds:!0,animateAddingMarkers:!1,spiderfyDistanceMultiplier:1,polygonOptions:{}},initialize:function(a){L.Util.setOptions(this,a),this.options.iconCreateFunction||(this.options.iconCreateFunction=this._defaultIconCreateFunction),this._featureGroup=L.featureGroup(),this._featureGroup.on(L.FeatureGroup.EVENTS,this._propagateEvent,this),this._nonPointGroup=L.featureGroup(),this._nonPointGroup.on(L.FeatureGroup.EVENTS,this._propagateEvent,this),this._inZoomAnimation=0,this._needsClustering=[],this._needsRemoving=[],this._currentShownBounds=null,this._queue=[]},addLayer:function(a){if(a instanceof L.LayerGroup){var b=[];for(var c in a._layers)b.push(a._layers[c]);return this.addLayers(b)}if(!a.getLatLng)return this._nonPointGroup.addLayer(a),this;if(!this._map)return this._needsClustering.push(a),this;if(this.hasLayer(a))return this;this._unspiderfy&&this._unspiderfy(),this._addLayer(a,this._maxZoom);var d=a,e=this._map.getZoom();if(a.__parent)for(;d.__parent._zoom>=e;)d=d.__parent;return this._currentShownBounds.contains(d.getLatLng())&&(this.options.animateAddingMarkers?this._animationAddLayer(a,d):this._animationAddLayerNonAnimated(a,d)),this},removeLayer:function(a){if(a instanceof L.LayerGroup){var b=[];for(var c in a._layers)b.push(a._layers[c]);return this.removeLayers(b)}return a.getLatLng?this._map?a.__parent?(this._unspiderfy&&(this._unspiderfy(),this._unspiderfyLayer(a)),this._removeLayer(a,!0),this._featureGroup.hasLayer(a)&&(this._featureGroup.removeLayer(a),a.setOpacity&&a.setOpacity(1)),this):this:(!this._arraySplice(this._needsClustering,a)&&this.hasLayer(a)&&this._needsRemoving.push(a),this):(this._nonPointGroup.removeLayer(a),this)},addLayers:function(a){var b,c,d,e=this._map,f=this._featureGroup,g=this._nonPointGroup;for(b=0,c=a.length;c>b;b++)if(d=a[b],d.getLatLng){if(!this.hasLayer(d))if(e){if(this._addLayer(d,this._maxZoom),d.__parent&&2===d.__parent.getChildCount()){var h=d.__parent.getAllChildMarkers(),i=h[0]===d?h[1]:h[0];f.removeLayer(i)}}else this._needsClustering.push(d)}else g.addLayer(d);return e&&(f.eachLayer(function(a){a instanceof L.MarkerCluster&&a._iconNeedsUpdate&&a._updateIcon()}),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds)),this},removeLayers:function(a){var b,c,d,e=this._featureGroup,f=this._nonPointGroup;if(!this._map){for(b=0,c=a.length;c>b;b++)d=a[b],this._arraySplice(this._needsClustering,d),f.removeLayer(d);return this}for(b=0,c=a.length;c>b;b++)d=a[b],d.__parent?(this._removeLayer(d,!0,!0),e.hasLayer(d)&&(e.removeLayer(d),d.setOpacity&&d.setOpacity(1))):f.removeLayer(d);return this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds),e.eachLayer(function(a){a instanceof L.MarkerCluster&&a._updateIcon()}),this},clearLayers:function(){return this._map||(this._needsClustering=[],delete this._gridClusters,delete this._gridUnclustered),this._noanimationUnspiderfy&&this._noanimationUnspiderfy(),this._featureGroup.clearLayers(),this._nonPointGroup.clearLayers(),this.eachLayer(function(a){delete a.__parent}),this._map&&this._generateInitialClusters(),this},getBounds:function(){var a=new L.LatLngBounds;if(this._topClusterLevel)a.extend(this._topClusterLevel._bounds);else for(var b=this._needsClustering.length-1;b>=0;b--)a.extend(this._needsClustering[b].getLatLng());return a.extend(this._nonPointGroup.getBounds()),a},eachLayer:function(a,b){var c,d=this._needsClustering.slice();for(this._topClusterLevel&&this._topClusterLevel.getAllChildMarkers(d),c=d.length-1;c>=0;c--)a.call(b,d[c]);this._nonPointGroup.eachLayer(a,b)},getLayers:function(){var a=[];return this.eachLayer(function(b){a.push(b)}),a},getLayer:function(a){var b=null;return this.eachLayer(function(c){L.stamp(c)===a&&(b=c)}),b},hasLayer:function(a){if(!a)return!1;var b,c=this._needsClustering;for(b=c.length-1;b>=0;b--)if(c[b]===a)return!0;for(c=this._needsRemoving,b=c.length-1;b>=0;b--)if(c[b]===a)return!1;return!(!a.__parent||a.__parent._group!==this)||this._nonPointGroup.hasLayer(a)},zoomToShowLayer:function(a,b){var c=function(){if((a._icon||a.__parent._icon)&&!this._inZoomAnimation)if(this._map.off("moveend",c,this),this.off("animationend",c,this),a._icon)b();else if(a.__parent._icon){var d=function(){this.off("spiderfied",d,this),b()};this.on("spiderfied",d,this),a.__parent.spiderfy()}};a._icon&&this._map.getBounds().contains(a.getLatLng())?b():a.__parent._zoom<this._map.getZoom()?(this._map.on("moveend",c,this),this._map.panTo(a.getLatLng())):(this._map.on("moveend",c,this),this.on("animationend",c,this),this._map.setView(a.getLatLng(),a.__parent._zoom+1),a.__parent.zoomToBounds())},onAdd:function(a){this._map=a;var b,c,d;if(!isFinite(this._map.getMaxZoom()))throw"Map has no maxZoom specified";for(this._featureGroup.onAdd(a),this._nonPointGroup.onAdd(a),this._gridClusters||this._generateInitialClusters(),b=0,c=this._needsRemoving.length;c>b;b++)d=this._needsRemoving[b],this._removeLayer(d,!0);for(this._needsRemoving=[],b=0,c=this._needsClustering.length;c>b;b++)d=this._needsClustering[b],d.getLatLng?d.__parent||this._addLayer(d,this._maxZoom):this._featureGroup.addLayer(d);this._needsClustering=[],this._map.on("zoomend",this._zoomEnd,this),this._map.on("moveend",this._moveEnd,this),this._spiderfierOnAdd&&this._spiderfierOnAdd(),this._bindEvents(),this._zoom=this._map.getZoom(),this._currentShownBounds=this._getExpandedVisibleBounds(),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds)},onRemove:function(a){a.off("zoomend",this._zoomEnd,this),a.off("moveend",this._moveEnd,this),this._unbindEvents(),this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim",""),this._spiderfierOnRemove&&this._spiderfierOnRemove(),this._hideCoverage(),this._featureGroup.onRemove(a),this._nonPointGroup.onRemove(a),this._featureGroup.clearLayers(),this._map=null},getVisibleParent:function(a){for(var b=a;b&&!b._icon;)b=b.__parent;return b||null},_arraySplice:function(a,b){for(var c=a.length-1;c>=0;c--)if(a[c]===b)return a.splice(c,1),!0},_removeLayer:function(a,b,c){var d=this._gridClusters,e=this._gridUnclustered,f=this._featureGroup,g=this._map;if(b)for(var h=this._maxZoom;h>=0&&e[h].removeObject(a,g.project(a.getLatLng(),h));h--);var i,j=a.__parent,k=j._markers;for(this._arraySplice(k,a);j&&(j._childCount--,!(j._zoom<0));)b&&j._childCount<=1?(i=j._markers[0]===a?j._markers[1]:j._markers[0],d[j._zoom].removeObject(j,g.project(j._cLatLng,j._zoom)),e[j._zoom].addObject(i,g.project(i.getLatLng(),j._zoom)),this._arraySplice(j.__parent._childClusters,j),j.__parent._markers.push(i),i.__parent=j.__parent,j._icon&&(f.removeLayer(j),c||f.addLayer(i))):(j._recalculateBounds(),c&&j._icon||j._updateIcon()),j=j.__parent;delete a.__parent},_isOrIsParent:function(a,b){for(;b;){if(a===b)return!0;b=b.parentNode}return!1},_propagateEvent:function(a){if(a.layer instanceof L.MarkerCluster){if(a.originalEvent&&this._isOrIsParent(a.layer._icon,a.originalEvent.relatedTarget))return;a.type="cluster"+a.type}this.fire(a.type,a)},_defaultIconCreateFunction:function(a){var b=a.getChildCount(),c=" marker-cluster-";return c+=10>b?"small":100>b?"medium":"large",new L.DivIcon({html:"<div><span>"+b+"</span></div>",className:"marker-cluster"+c,iconSize:new L.Point(40,40)})},_bindEvents:function(){var a=this._map,b=this.options.spiderfyOnMaxZoom,c=this.options.showCoverageOnHover,d=this.options.zoomToBoundsOnClick;(b||d)&&this.on("clusterclick",this._zoomOrSpiderfy,this),c&&(this.on("clustermouseover",this._showCoverage,this),this.on("clustermouseout",this._hideCoverage,this),a.on("zoomend",this._hideCoverage,this))},_zoomOrSpiderfy:function(a){var b=this._map;b.getMaxZoom()===b.getZoom()?this.options.spiderfyOnMaxZoom&&a.layer.spiderfy():this.options.zoomToBoundsOnClick&&a.layer.zoomToBounds(),a.originalEvent&&13===a.originalEvent.keyCode&&b._container.focus()},_showCoverage:function(a){var b=this._map;this._inZoomAnimation||(this._shownPolygon&&b.removeLayer(this._shownPolygon),a.layer.getChildCount()>2&&a.layer!==this._spiderfied&&(this._shownPolygon=new L.Polygon(a.layer.getConvexHull(),this.options.polygonOptions),b.addLayer(this._shownPolygon)))},_hideCoverage:function(){this._shownPolygon&&(this._map.removeLayer(this._shownPolygon),this._shownPolygon=null)},_unbindEvents:function(){var a=this.options.spiderfyOnMaxZoom,b=this.options.showCoverageOnHover,c=this.options.zoomToBoundsOnClick,d=this._map;(a||c)&&this.off("clusterclick",this._zoomOrSpiderfy,this),b&&(this.off("clustermouseover",this._showCoverage,this),this.off("clustermouseout",this._hideCoverage,this),d.off("zoomend",this._hideCoverage,this))},_zoomEnd:function(){this._map&&(this._mergeSplitClusters(),this._zoom=this._map._zoom,this._currentShownBounds=this._getExpandedVisibleBounds())},_moveEnd:function(){if(!this._inZoomAnimation){var a=this._getExpandedVisibleBounds();this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,this._zoom,a),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._map._zoom,a),this._currentShownBounds=a}},_generateInitialClusters:function(){var a=this._map.getMaxZoom(),b=this.options.maxClusterRadius;this.options.disableClusteringAtZoom&&(a=this.options.disableClusteringAtZoom-1),this._maxZoom=a,this._gridClusters={},this._gridUnclustered={};for(var c=a;c>=0;c--)this._gridClusters[c]=new L.DistanceGrid(b),this._gridUnclustered[c]=new L.DistanceGrid(b);this._topClusterLevel=new L.MarkerCluster(this,-1)},_addLayer:function(a,b){var c,d,e=this._gridClusters,f=this._gridUnclustered;for(this.options.singleMarkerMode&&(a.options.icon=this.options.iconCreateFunction({getChildCount:function(){return 1},getAllChildMarkers:function(){return[a]}}));b>=0;b--){c=this._map.project(a.getLatLng(),b);var g=e[b].getNearObject(c);if(g)return g._addChild(a),void(a.__parent=g);if(g=f[b].getNearObject(c)){var h=g.__parent;h&&this._removeLayer(g,!1);var i=new L.MarkerCluster(this,b,g,a);e[b].addObject(i,this._map.project(i._cLatLng,b)),g.__parent=i,a.__parent=i;var j=i;for(d=b-1;d>h._zoom;d--)j=new L.MarkerCluster(this,d,j),e[d].addObject(j,this._map.project(g.getLatLng(),d));for(h._addChild(j),d=b;d>=0&&f[d].removeObject(g,this._map.project(g.getLatLng(),d));d--);return}f[b].addObject(a,c)}this._topClusterLevel._addChild(a),a.__parent=this._topClusterLevel},_enqueue:function(a){this._queue.push(a),this._queueTimeout||(this._queueTimeout=setTimeout(L.bind(this._processQueue,this),300))},_processQueue:function(){for(var a=0;a<this._queue.length;a++)this._queue[a].call(this);this._queue.length=0,clearTimeout(this._queueTimeout),this._queueTimeout=null},_mergeSplitClusters:function(){this._processQueue(),this._zoom<this._map._zoom&&this._currentShownBounds.contains(this._getExpandedVisibleBounds())?(this._animationStart(),this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,this._zoom,this._getExpandedVisibleBounds()),this._animationZoomIn(this._zoom,this._map._zoom)):this._zoom>this._map._zoom?(this._animationStart(),this._animationZoomOut(this._zoom,this._map._zoom)):this._moveEnd()},_getExpandedVisibleBounds:function(){if(!this.options.removeOutsideVisibleBounds)return this.getBounds();var a=this._map,b=a.getBounds(),c=b._southWest,d=b._northEast,e=L.Browser.mobile?0:Math.abs(c.lat-d.lat),f=L.Browser.mobile?0:Math.abs(c.lng-d.lng);return new L.LatLngBounds(new L.LatLng(c.lat-e,c.lng-f,!0),new L.LatLng(d.lat+e,d.lng+f,!0))},_animationAddLayerNonAnimated:function(a,b){if(b===a)this._featureGroup.addLayer(a);else if(2===b._childCount){b._addToMap();var c=b.getAllChildMarkers();this._featureGroup.removeLayer(c[0]),this._featureGroup.removeLayer(c[1])}else b._updateIcon()}}),L.MarkerClusterGroup.include(L.DomUtil.TRANSITION?{_animationStart:function(){this._map._mapPane.className+=" leaflet-cluster-anim",this._inZoomAnimation++},_animationEnd:function(){this._map&&(this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim","")),this._inZoomAnimation--,this.fire("animationend")},_animationZoomIn:function(a,b){var c,d=this._getExpandedVisibleBounds(),e=this._featureGroup;this._topClusterLevel._recursively(d,a,0,function(f){var g,h=f._latlng,i=f._markers;for(d.contains(h)||(h=null),f._isSingleParent()&&a+1===b?(e.removeLayer(f),f._recursivelyAddChildrenToMap(null,b,d)):(f.setOpacity(0),f._recursivelyAddChildrenToMap(h,b,d)),c=i.length-1;c>=0;c--)g=i[c],d.contains(g._latlng)||e.removeLayer(g)}),this._forceLayout(),this._topClusterLevel._recursivelyBecomeVisible(d,b),e.eachLayer(function(a){a instanceof L.MarkerCluster||!a._icon||a.setOpacity(1)}),this._topClusterLevel._recursively(d,a,b,function(a){a._recursivelyRestoreChildPositions(b)}),this._enqueue(function(){this._topClusterLevel._recursively(d,a,0,function(a){e.removeLayer(a),a.setOpacity(1)}),this._animationEnd()})},_animationZoomOut:function(a,b){this._animationZoomOutSingle(this._topClusterLevel,a-1,b),this._topClusterLevel._recursivelyAddChildrenToMap(null,b,this._getExpandedVisibleBounds()),this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,a,this._getExpandedVisibleBounds())},_animationZoomOutSingle:function(a,b,c){var d=this._getExpandedVisibleBounds();a._recursivelyAnimateChildrenInAndAddSelfToMap(d,b+1,c);var e=this;this._forceLayout(),a._recursivelyBecomeVisible(d,c),this._enqueue(function(){if(1===a._childCount){var f=a._markers[0];f.setLatLng(f.getLatLng()),f.setOpacity(1)}else a._recursively(d,c,0,function(a){a._recursivelyRemoveChildrenFromMap(d,b+1)});e._animationEnd()})},_animationAddLayer:function(a,b){var c=this,d=this._featureGroup;d.addLayer(a),b!==a&&(b._childCount>2?(b._updateIcon(),this._forceLayout(),this._animationStart(),a._setPos(this._map.latLngToLayerPoint(b.getLatLng())),a.setOpacity(0),this._enqueue(function(){d.removeLayer(a),a.setOpacity(1),c._animationEnd()})):(this._forceLayout(),c._animationStart(),c._animationZoomOutSingle(b,this._map.getMaxZoom(),this._map.getZoom())))},_forceLayout:function(){L.Util.falseFn(b.body.offsetWidth)}}:{_animationStart:function(){},_animationZoomIn:function(a,b){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,a),this._topClusterLevel._recursivelyAddChildrenToMap(null,b,this._getExpandedVisibleBounds())},_animationZoomOut:function(a,b){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,a),this._topClusterLevel._recursivelyAddChildrenToMap(null,b,this._getExpandedVisibleBounds())},_animationAddLayer:function(a,b){this._animationAddLayerNonAnimated(a,b)}}),L.markerClusterGroup=function(a){return new L.MarkerClusterGroup(a)},L.MarkerCluster=L.Marker.extend({initialize:function(a,b,c,d){L.Marker.prototype.initialize.call(this,c?c._cLatLng||c.getLatLng():new L.LatLng(0,0),{icon:this}),this._group=a,this._zoom=b,this._markers=[],this._childClusters=[],this._childCount=0,this._iconNeedsUpdate=!0,this._bounds=new L.LatLngBounds,c&&this._addChild(c),d&&this._addChild(d)},getAllChildMarkers:function(a){a=a||[];for(var b=this._childClusters.length-1;b>=0;b--)this._childClusters[b].getAllChildMarkers(a);for(var c=this._markers.length-1;c>=0;c--)a.push(this._markers[c]);return a},getChildCount:function(){return this._childCount},zoomToBounds:function(){for(var a,b=this._childClusters.slice(),c=this._group._map,d=c.getBoundsZoom(this._bounds),e=this._zoom+1,f=c.getZoom();b.length>0&&d>e;){e++;var g=[];for(a=0;a<b.length;a++)g=g.concat(b[a]._childClusters);b=g}d>e?this._group._map.setView(this._latlng,e):f>=d?this._group._map.setView(this._latlng,f+1):this._group._map.fitBounds(this._bounds)},getBounds:function(){var a=new L.LatLngBounds;return a.extend(this._bounds),a},_updateIcon:function(){this._iconNeedsUpdate=!0,this._icon&&this.setIcon(this)},createIcon:function(){return this._iconNeedsUpdate&&(this._iconObj=this._group.options.iconCreateFunction(this),this._iconNeedsUpdate=!1),this._iconObj.createIcon()},createShadow:function(){return this._iconObj.createShadow()},_addChild:function(a,b){this._iconNeedsUpdate=!0,this._expandBounds(a),a instanceof L.MarkerCluster?(b||(this._childClusters.push(a),a.__parent=this),this._childCount+=a._childCount):(b||this._markers.push(a),this._childCount++),this.__parent&&this.__parent._addChild(a,!0)},_expandBounds:function(a){var b,c=a._wLatLng||a._latlng;a instanceof L.MarkerCluster?(this._bounds.extend(a._bounds),b=a._childCount):(this._bounds.extend(c),b=1),this._cLatLng||(this._cLatLng=a._cLatLng||c);var d=this._childCount+b;this._wLatLng?(this._wLatLng.lat=(c.lat*b+this._wLatLng.lat*this._childCount)/d,this._wLatLng.lng=(c.lng*b+this._wLatLng.lng*this._childCount)/d):this._latlng=this._wLatLng=new L.LatLng(c.lat,c.lng)},_addToMap:function(a){a&&(this._backupLatlng=this._latlng,this.setLatLng(a)),this._group._featureGroup.addLayer(this)},_recursivelyAnimateChildrenIn:function(a,b,c){this._recursively(a,0,c-1,function(a){var c,d,e=a._markers;for(c=e.length-1;c>=0;c--)d=e[c],d._icon&&(d._setPos(b),d.setOpacity(0))},function(a){var c,d,e=a._childClusters;for(c=e.length-1;c>=0;c--)d=e[c],d._icon&&(d._setPos(b),d.setOpacity(0))})},_recursivelyAnimateChildrenInAndAddSelfToMap:function(a,b,c){this._recursively(a,c,0,function(d){d._recursivelyAnimateChildrenIn(a,d._group._map.latLngToLayerPoint(d.getLatLng()).round(),b),d._isSingleParent()&&b-1===c?(d.setOpacity(1),d._recursivelyRemoveChildrenFromMap(a,b)):d.setOpacity(0),d._addToMap()})},_recursivelyBecomeVisible:function(a,b){this._recursively(a,0,b,null,function(a){a.setOpacity(1)})},_recursivelyAddChildrenToMap:function(a,b,c){this._recursively(c,-1,b,function(d){if(b!==d._zoom)for(var e=d._markers.length-1;e>=0;e--){var f=d._markers[e];c.contains(f._latlng)&&(a&&(f._backupLatlng=f.getLatLng(),f.setLatLng(a),f.setOpacity&&f.setOpacity(0)),d._group._featureGroup.addLayer(f))}},function(b){b._addToMap(a)})},_recursivelyRestoreChildPositions:function(a){for(var b=this._markers.length-1;b>=0;b--){var c=this._markers[b];c._backupLatlng&&(c.setLatLng(c._backupLatlng),delete c._backupLatlng)}if(a-1===this._zoom)for(var d=this._childClusters.length-1;d>=0;d--)this._childClusters[d]._restorePosition();else for(var e=this._childClusters.length-1;e>=0;e--)this._childClusters[e]._recursivelyRestoreChildPositions(a)},_restorePosition:function(){this._backupLatlng&&(this.setLatLng(this._backupLatlng),delete this._backupLatlng)},_recursivelyRemoveChildrenFromMap:function(a,b,c){var d,e;this._recursively(a,-1,b-1,function(a){for(e=a._markers.length-1;e>=0;e--)d=a._markers[e],c&&c.contains(d._latlng)||(a._group._featureGroup.removeLayer(d),d.setOpacity&&d.setOpacity(1))},function(a){for(e=a._childClusters.length-1;e>=0;e--)d=a._childClusters[e],c&&c.contains(d._latlng)||(a._group._featureGroup.removeLayer(d),d.setOpacity&&d.setOpacity(1))})},_recursively:function(a,b,c,d,e){var f,g,h=this._childClusters,i=this._zoom;if(b>i)for(f=h.length-1;f>=0;f--)g=h[f],a.intersects(g._bounds)&&g._recursively(a,b,c,d,e);else if(d&&d(this),e&&this._zoom===c&&e(this),c>i)for(f=h.length-1;f>=0;f--)g=h[f],a.intersects(g._bounds)&&g._recursively(a,b,c,d,e)},_recalculateBounds:function(){var a,b=this._markers,c=this._childClusters;for(this._bounds=new L.LatLngBounds,delete this._wLatLng,a=b.length-1;a>=0;a--)this._expandBounds(b[a]);for(a=c.length-1;a>=0;a--)this._expandBounds(c[a])},_isSingleParent:function(){return this._childClusters.length>0&&this._childClusters[0]._childCount===this._childCount}}),L.DistanceGrid=function(a){this._cellSize=a,this._sqCellSize=a*a,this._grid={},this._objectPoint={}},L.DistanceGrid.prototype={addObject:function(a,b){var c=this._getCoord(b.x),d=this._getCoord(b.y),e=this._grid,f=e[d]=e[d]||{},g=f[c]=f[c]||[],h=L.Util.stamp(a);this._objectPoint[h]=b,g.push(a)},updateObject:function(a,b){this.removeObject(a),this.addObject(a,b)},removeObject:function(a,b){var c,d,e=this._getCoord(b.x),f=this._getCoord(b.y),g=this._grid,h=g[f]=g[f]||{},i=h[e]=h[e]||[];for(delete this._objectPoint[L.Util.stamp(a)],c=0,d=i.length;d>c;c++)if(i[c]===a)return i.splice(c,1),1===d&&delete h[e],!0},eachObject:function(a,b){var c,d,e,f,g,h,i,j=this._grid;for(c in j){g=j[c];for(d in g)for(h=g[d],e=0,f=h.length;f>e;e++)i=a.call(b,h[e]),i&&(e--,f--)}},getNearObject:function(a){var b,c,d,e,f,g,h,i,j=this._getCoord(a.x),k=this._getCoord(a.y),l=this._objectPoint,m=this._sqCellSize,n=null;for(b=k-1;k+1>=b;b++)if(e=this._grid[b])for(c=j-1;j+1>=c;c++)if(f=e[c])for(d=0,g=f.length;g>d;d++)h=f[d],i=this._sqDist(l[L.Util.stamp(h)],a),m>i&&(m=i,n=h);return n},_getCoord:function(a){return Math.floor(a/this._cellSize)},_sqDist:function(a,b){var c=b.x-a.x,d=b.y-a.y;return c*c+d*d}},function(){L.QuickHull={getDistant:function(a,b){var c=b[1].lat-b[0].lat,d=b[0].lng-b[1].lng;return d*(a.lat-b[0].lat)+c*(a.lng-b[0].lng)},findMostDistantPointFromBaseLine:function(a,b){var c,d,e,f=0,g=null,h=[];for(c=b.length-1;c>=0;c--)d=b[c],e=this.getDistant(d,a),e>0&&(h.push(d),e>f&&(f=e,g=d));return{maxPoint:g,newPoints:h}},buildConvexHull:function(a,b){var c=[],d=this.findMostDistantPointFromBaseLine(a,b);return d.maxPoint?(c=c.concat(this.buildConvexHull([a[0],d.maxPoint],d.newPoints)),c=c.concat(this.buildConvexHull([d.maxPoint,a[1]],d.newPoints))):[a[0]]},getConvexHull:function(a){var b,c=!1,d=!1,e=null,f=null;for(b=a.length-1;b>=0;b--){var g=a[b];(c===!1||g.lat>c)&&(e=g,c=g.lat),(d===!1||g.lat<d)&&(f=g,d=g.lat)}var h=[].concat(this.buildConvexHull([f,e],a),this.buildConvexHull([e,f],a));return h}}}(),L.MarkerCluster.include({getConvexHull:function(){var a,b,c=this.getAllChildMarkers(),d=[];for(b=c.length-1;b>=0;b--)a=c[b].getLatLng(),d.push(a);return L.QuickHull.getConvexHull(d)}}),L.MarkerCluster.include({_2PI:2*Math.PI,_circleFootSeparation:25,_circleStartAngle:Math.PI/6,_spiralFootSeparation:28,_spiralLengthStart:11,_spiralLengthFactor:5,_circleSpiralSwitchover:9,spiderfy:function(){if(this._group._spiderfied!==this&&!this._group._inZoomAnimation){var a,b=this.getAllChildMarkers(),c=this._group,d=c._map,e=d.latLngToLayerPoint(this._latlng);this._group._unspiderfy(),this._group._spiderfied=this,b.length>=this._circleSpiralSwitchover?a=this._generatePointsSpiral(b.length,e):(e.y+=10,a=this._generatePointsCircle(b.length,e)),this._animationSpiderfy(b,a)}},unspiderfy:function(a){this._group._inZoomAnimation||(this._animationUnspiderfy(a),this._group._spiderfied=null)},_generatePointsCircle:function(a,b){var c,d,e=this._group.options.spiderfyDistanceMultiplier*this._circleFootSeparation*(2+a),f=e/this._2PI,g=this._2PI/a,h=[];for(h.length=a,c=a-1;c>=0;c--)d=this._circleStartAngle+c*g,h[c]=new L.Point(b.x+f*Math.cos(d),b.y+f*Math.sin(d))._round();return h},_generatePointsSpiral:function(a,b){var c,d=this._group.options.spiderfyDistanceMultiplier*this._spiralLengthStart,e=this._group.options.spiderfyDistanceMultiplier*this._spiralFootSeparation,f=this._group.options.spiderfyDistanceMultiplier*this._spiralLengthFactor,g=0,h=[];for(h.length=a,c=a-1;c>=0;c--)g+=e/d+5e-4*c,h[c]=new L.Point(b.x+d*Math.cos(g),b.y+d*Math.sin(g))._round(),d+=this._2PI*f/g;return h},_noanimationUnspiderfy:function(){var a,b,c=this._group,d=c._map,e=c._featureGroup,f=this.getAllChildMarkers();for(this.setOpacity(1),b=f.length-1;b>=0;b--)a=f[b],e.removeLayer(a),a._preSpiderfyLatlng&&(a.setLatLng(a._preSpiderfyLatlng),delete a._preSpiderfyLatlng),a.setZIndexOffset&&a.setZIndexOffset(0),a._spiderLeg&&(d.removeLayer(a._spiderLeg),delete a._spiderLeg);c._spiderfied=null}}),L.MarkerCluster.include(L.DomUtil.TRANSITION?{SVG_ANIMATION:function(){return b.createElementNS("http://www.w3.org/2000/svg","animate").toString().indexOf("SVGAnimate")>-1}(),_animationSpiderfy:function(a,c){var d,e,f,g,h=this,i=this._group,j=i._map,k=i._featureGroup,l=j.latLngToLayerPoint(this._latlng);for(d=a.length-1;d>=0;d--)e=a[d],e.setOpacity?(e.setZIndexOffset(1e6),e.setOpacity(0),k.addLayer(e),e._setPos(l)):k.addLayer(e);i._forceLayout(),i._animationStart();var m=L.Path.SVG?0:.3,n=L.Path.SVG_NS;for(d=a.length-1;d>=0;d--)if(g=j.layerPointToLatLng(c[d]),e=a[d],e._preSpiderfyLatlng=e._latlng,e.setLatLng(g),e.setOpacity&&e.setOpacity(1),f=new L.Polyline([h._latlng,g],{weight:1.5,color:"#222",opacity:m}),j.addLayer(f),e._spiderLeg=f,L.Path.SVG&&this.SVG_ANIMATION){var o=f._path.getTotalLength();f._path.setAttribute("stroke-dasharray",o+","+o);var p=b.createElementNS(n,"animate");p.setAttribute("attributeName","stroke-dashoffset"),p.setAttribute("begin","indefinite"),p.setAttribute("from",o),p.setAttribute("to",0),p.setAttribute("dur",.25),f._path.appendChild(p),p.beginElement(),p=b.createElementNS(n,"animate"),p.setAttribute("attributeName","stroke-opacity"),p.setAttribute("attributeName","stroke-opacity"),p.setAttribute("begin","indefinite"),p.setAttribute("from",0),p.setAttribute("to",.5),p.setAttribute("dur",.25),f._path.appendChild(p),p.beginElement()}if(h.setOpacity(.3),L.Path.SVG)for(this._group._forceLayout(),d=a.length-1;d>=0;d--)e=a[d]._spiderLeg,e.options.opacity=.5,e._path.setAttribute("stroke-opacity",.5);setTimeout(function(){i._animationEnd(),i.fire("spiderfied")},200)},_animationUnspiderfy:function(a){var b,c,d,e=this._group,f=e._map,g=e._featureGroup,h=a?f._latLngToNewLayerPoint(this._latlng,a.zoom,a.center):f.latLngToLayerPoint(this._latlng),i=this.getAllChildMarkers(),j=L.Path.SVG&&this.SVG_ANIMATION;for(e._animationStart(),this.setOpacity(1),c=i.length-1;c>=0;c--)b=i[c],b._preSpiderfyLatlng&&(b.setLatLng(b._preSpiderfyLatlng),delete b._preSpiderfyLatlng,b.setOpacity?(b._setPos(h),b.setOpacity(0)):g.removeLayer(b),j&&(d=b._spiderLeg._path.childNodes[0],d.setAttribute("to",d.getAttribute("from")),d.setAttribute("from",0),d.beginElement(),d=b._spiderLeg._path.childNodes[1],d.setAttribute("from",.5),d.setAttribute("to",0),d.setAttribute("stroke-opacity",0),d.beginElement(),b._spiderLeg._path.setAttribute("stroke-opacity",0)));setTimeout(function(){var a=0;for(c=i.length-1;c>=0;c--)b=i[c],b._spiderLeg&&a++;for(c=i.length-1;c>=0;c--)b=i[c],b._spiderLeg&&(b.setOpacity&&(b.setOpacity(1),b.setZIndexOffset(0)),a>1&&g.removeLayer(b),f.removeLayer(b._spiderLeg),delete b._spiderLeg);e._animationEnd()},200)}}:{_animationSpiderfy:function(a,b){var c,d,e,f,g=this._group,h=g._map,i=g._featureGroup;for(c=a.length-1;c>=0;c--)f=h.layerPointToLatLng(b[c]),d=a[c],d._preSpiderfyLatlng=d._latlng,d.setLatLng(f),d.setZIndexOffset&&d.setZIndexOffset(1e6),i.addLayer(d),e=new L.Polyline([this._latlng,f],{weight:1.5,color:"#222"}),h.addLayer(e),d._spiderLeg=e;this.setOpacity(.3),g.fire("spiderfied")},_animationUnspiderfy:function(){this._noanimationUnspiderfy()}}),L.MarkerClusterGroup.include({_spiderfied:null,_spiderfierOnAdd:function(){this._map.on("click",this._unspiderfyWrapper,this),this._map.options.zoomAnimation&&this._map.on("zoomstart",this._unspiderfyZoomStart,this),this._map.on("zoomend",this._noanimationUnspiderfy,this),L.Path.SVG&&!L.Browser.touch&&this._map._initPathRoot()},_spiderfierOnRemove:function(){this._map.off("click",this._unspiderfyWrapper,this),this._map.off("zoomstart",this._unspiderfyZoomStart,this),this._map.off("zoomanim",this._unspiderfyZoomAnim,this),this._unspiderfy()},_unspiderfyZoomStart:function(){this._map&&this._map.on("zoomanim",this._unspiderfyZoomAnim,this)},_unspiderfyZoomAnim:function(a){L.DomUtil.hasClass(this._map._mapPane,"leaflet-touching")||(this._map.off("zoomanim",this._unspiderfyZoomAnim,this),this._unspiderfy(a))},_unspiderfyWrapper:function(){this._unspiderfy()},_unspiderfy:function(a){this._spiderfied&&this._spiderfied.unspiderfy(a)},_noanimationUnspiderfy:function(){this._spiderfied&&this._spiderfied._noanimationUnspiderfy()},_unspiderfyLayer:function(a){a._spiderLeg&&(this._featureGroup.removeLayer(a),a.setOpacity(1),a.setZIndexOffset(0),this._map.removeLayer(a._spiderLeg),delete a._spiderLeg)}})}(window,document);