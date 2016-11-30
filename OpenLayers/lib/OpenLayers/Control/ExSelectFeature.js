OpenLayers.Control.ExSelectFeature = OpenLayers.Class(OpenLayers.Control.SelectFeature,{


    /**
     * APIProperty: line
     * {Boolean} Allow feature selection by drawing a polygon.
     */
    path:false,

    /**
     * APIProperty: buffer
     * {Integer} 只有当path为true时，该参数才有效，缓冲分析的距离.
     */
    buffer:1000,

    /**
     * APIProperty: polygon
     * {Boolean} Allow feature selection by drawing a polygon.
     */
    polygon:false,

    /**
     * Constructor: MySelectFeature
     * Create a new control for selecting features.
     *
     * Parameters:
     * layers - {<OpenLayers.Layer.Vector>}, or an array of vector layers. The
     *     layer(s) this control will select features from.
     * options - {Object} 
     */
    initialize: function(layers, options) {
        OpenLayers.Control.SelectFeature.prototype.initialize.apply(this, arguments);
        //自定义方法（画线）
        if (this.path) {
            this.handlers.path = new OpenLayers.Handler.Path(
                this, {done: this.selectPath},
                {pathDivClassName: "olHandlerPathSelectFeature"}
            ); 
        }
        //自定义增加的方法(画多边形)
        if (this.polygon) {
            this.handlers.polygon = new OpenLayers.Handler.Polygon(
                this, {done: this.selectPolygon},
                {polygonDivClassName: "olHandlerPolygonSelectFeature"}
            ); 
        }
    },

    /**
     * Method: activate
     * Activates the control.
     * 
     * Returns:
     * {Boolean} The control was effectively activated.
     */
    activate: function () {
        if (!this.active) {
            if(this.layers) {
                this.map.addLayer(this.layer);
            }
            this.handlers.feature.activate();
            if(this.box && this.handlers.box) {
                this.handlers.box.activate();
            }
            //自定义
            if(this.path && this.handlers.path) {
                this.handlers.path.activate();
            }
            if(this.polygon && this.handlers.polygon) {
                this.handlers.polygon.activate();
            }
        }
        return OpenLayers.Control.prototype.activate.apply(
            this, arguments
        );
    },

    /**
     * Method: deactivate
     * Deactivates the control.
     * 
     * Returns:
     * {Boolean} The control was effectively deactivated.
     */
    deactivate: function () {
        if (this.active) {
            this.handlers.feature.deactivate();
            if(this.handlers.box) {
                this.handlers.box.deactivate();
            }
            //自定义
            if(this.handlers.path) {
                this.handlers.path.deactivate();
            }
            if(this.handlers.polygon) {
                this.handlers.polygon.deactivate();
            }
            if(this.layers) {
                this.map.removeLayer(this.layer);
            }
        }
        return OpenLayers.Control.prototype.deactivate.apply(
            this, arguments
        );
    },

    /**
     * Method: setMap
     */
    setMap: function(){
        OpenLayers.Control.SelectFeature.prototype.setMap.apply(this,arguments);
        //自定义
        if (this.path) {
            this.handlers.path.setMap(map);
        }
        if (this.polygon) {
            this.handlers.polygon.setMap(map);
        }
    },

    /**
     * Method: selectPolygon
     * Callback from the handlers.Polygon set up when <polygon> selection is true
     *     on.
     *
     * Parameters:
     * position - {<OpenLayers.Geometry.Polygon> }  
     */
    selectPolygon: function(position) {
        if (position instanceof OpenLayers.Geometry.Polygon) {
            
            // if multiple is false, first deselect currently selected features
            if (!this.multipleSelect()) {
                this.unselectAll();
            }
            
            // because we're using a polygon, we consider we want multiple selection
            var prevMultiple = this.multiple;
            this.multiple = true;
            var layers = this.layers || [this.layer];
            this.events.triggerEvent("polygonselectionstart", {layers: layers}); 
            var layer;
            for(var l=0; l<layers.length; ++l) {
                layer = layers[l];
                for(var i=0, len = layer.features.length; i<len; ++i) {
                    var feature = layer.features[i];
                    // check if the feature is displayed
                    if (!feature.getVisibility()) {
                        continue;
                    }
                    if (this.geometryTypes == null || OpenLayers.Util.indexOf(
                            this.geometryTypes, feature.geometry.CLASS_NAME) > -1) {
                        if (position.intersects(feature.geometry)) {
                            if (OpenLayers.Util.indexOf(layer.selectedFeatures, feature) == -1) {
                                this.select(feature);
                            }
                        }
                    }
                }
            }
            this.multiple = prevMultiple;
            this.events.triggerEvent("polygonselectionend", {layers: layers}); 
        }
    },


    /**
     * Method: selectPath
     * Callback from the handlers.Path set up when <path> selection is true
     *     on.
     *
     * Parameters:
     * position - {<OpenLayers.Geometry.Path> }  
     */
    selectPath: function(position) {
        if (position instanceof OpenLayers.Geometry.LineString) {
            
            // if multiple is false, first deselect currently selected features
            if (!this.multipleSelect()) {
                this.unselectAll();
            }
            
            // because we're using a polygon, we consider we want multiple selection
            var prevMultiple = this.multiple;
            this.multiple = true;
            var layers = this.layers || [this.layer];
            this.events.triggerEvent("pathselectionstart", {layers: layers}); 
            var layer;
            for(var l=0; l<layers.length; ++l) {
                layer = layers[l];
                for(var i=0, len = layer.features.length; i<len; ++i) {
                    var feature = layer.features[i];
                    // check if the feature is displayed
                    if (!feature.getVisibility()) {
                        continue;
                    }
                    if (this.geometryTypes == null || OpenLayers.Util.indexOf(
                            this.geometryTypes, feature.geometry.CLASS_NAME) > -1) {
                        //计算要素到线的距离
                        var distance = position.distanceTo(feature.geometry);
                        // console.log(distance);
                        if (distance<this.buffer) {
                            feature.attributes.distance = distance;
                            if (OpenLayers.Util.indexOf(layer.selectedFeatures, feature) == -1) {
                                this.select(feature);
                            }
                        }
                    }
                }
            }
            this.multiple = prevMultiple;
            this.events.triggerEvent("pathselectionend", {layers: layers}); 
        }
    },

    /**
     * Method: setBuffer
     */
    setBuffer: function(){
        
    },

    CLASS_NAME: "OpenLayers.Control.ExSelectFeature"
});