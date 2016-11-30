/* Copyright (c) 2002-2012 by Yhte*/

/**
 * @class 
 */
Yhte.gis.layers.MapLinkLayer = OpenLayers.Class(OpenLayers.Layer.Grid,{
    tileSize:new OpenLayers.Size(512,512),
    isBaseLayer: true,
    tileOrigin:null,
    serverResolutions:null,
    
    initialize:function(name,url,options){
        var newArguments = [];
        newArguments.push(name, url, {}, options);
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, newArguments);
    },
    
    clone: function (obj) {
        
        if (obj == null) {
            obj = new Yhte.gis.layers.MapLinkLayer(this.name,
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
        
        var rb = -1 * 100000 * bounds.bottom;
        var rl = 100000 * bounds.left;
        var rr = 100000 * bounds.right;
        var rt = -1 * 100000 * bounds.top;
        var sc = size.w/(rr - rl);
        
        var url = this.url + 
            "?method=getimg" + 
            "&ch=" + size.h +
            "&cw=" + size.w +
            "&id=" + 0 +
            "&rl=" + rl +
            "&rr=" + rr +
             "&rt=" + rt +
             "&rb=" + rb +
             "&sc=" + sc +
             "&format=" +"jpg";
        return url;
    },
    
    setMap: function(map) {
        OpenLayers.Layer.Grid.prototype.setMap.apply(this, arguments);
        if (!this.tileOrigin) { 
            this.tileOrigin = new OpenLayers.LonLat(this.map.maxExtent.left,
                                                this.map.maxExtent.bottom);
        }                                       
    },

    CLASS_NAME: "Yhte.gis.layers.MapLinkLayer"
});