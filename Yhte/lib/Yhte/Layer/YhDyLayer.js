/* Copyright (c) 2002-2012 by Yhte*/

/**
 * @class 
 */
OpenLayers.Layer.YhDyLayer = OpenLayers.Class(OpenLayers.Layer.Grid,{
    tileSize:new OpenLayers.Size(256,256),
    isBaseLayer: false,
    tileOrigin:null,
    serverResolutions:null,
    
    gutter:15,
    
    initialize:function(name,url,options){
        var newArguments = [];
        newArguments.push(name, url, {}, options);
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, newArguments);
    },
    
    clone: function (obj) {
        
        if (obj == null) {
            obj = new OpenLayers.Layer.YhDyLayer(this.name,
                                           this.url,
                                           this.getOptions());
        }

        //get all additions from superclasses
        obj = OpenLayers.Layer.Grid.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here

        return obj;
    },
    
    getURL:function(bounds){
        bounds = this.adjustBounds(bounds);
        var bbox = bounds.left + "," + bounds.bottom + "," + bounds.right + "," + bounds.top;
        var size = this.getImageSize();
        var url = this.url + "export?bbox=" + bbox + "&size=" + size.w + "," + size.h + "&inSR=102113&outSR=102113";
        return url;
    },
    
    setMap: function(map) {
        OpenLayers.Layer.Grid.prototype.setMap.apply(this, arguments);
        if (!this.tileOrigin) { 
            this.tileOrigin = new OpenLayers.LonLat(this.map.maxExtent.left,
                                                this.map.maxExtent.bottom);
        }                                       
    },

    CLASS_NAME: "OpenLayers.Layer.YhDyLayer"
});