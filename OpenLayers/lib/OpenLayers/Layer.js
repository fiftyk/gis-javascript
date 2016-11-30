/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/BaseTypes/Class.js
 * @requires OpenLayers/Map.js
 * @requires OpenLayers/Projection.js
 */

/**
 * Class: OpenLayers.Layer
 */
OpenLayers.Layer = OpenLayers.Class({

    /**
     * APIProperty: id
     * {String}
     */
    id: null,

    /** 
     * APIProperty: name
     * {String}
     */
    name: null,

    /** 
     * APIProperty: div
     * {DOMElement} 页面中放置地图的容器节点
     */
    div: null,

    /**
     * APIProperty: opacity
     * {Float} 图层的透明度. 浮点数 0.0 到 1.0. 默认值为 1.
     */
    opacity: 1,

    /**
     * APIProperty: alwaysInRange
     * {Boolean} 如果图层显示与否不是基于scale的, 这个值应被设置为true. 这将使图层
     *     像一个遮罩层,永远处于'active'状态,并且将导致calculateInRange()方法的计
     *     算结果永远为true.
     *     This will cause the layer, as an overlay, to always 
     *     be 'active', by always returning true from the calculateInRange() 
     *     function. 
     * 
     *     如果没有明确为 layer 指定该属性, 启动时, 在initResolutions()中，将基于
     *     layer 的 options 中是否包含scale相关属性来检测. 如果没有, 我们假定该值
     *     为 true.
     * 
     *     See #987 for more info.
     */
    alwaysInRange: null,   

    /**
     * Constant: RESOLUTION_PROPERTIES
     * {Array} 用于计算 resolutions 信息的属性.
     */
    RESOLUTION_PROPERTIES: [
        'scales', 'resolutions',
        'maxScale', 'minScale',
        'maxResolution', 'minResolution',
        'numZoomLevels', 'maxZoomLevel'
    ],

    /**
     * APIProperty: events
     * {<OpenLayers.Events>}
     *
     * 用下面的语句为一个事件注册监听器:
     * (code)
     * layer.events.register(type, obj, listener);
     * (end)
     *
     * 监听器被调用时传递一个事件对象. 至于事件的属性则要看到底是什么事件.
     *
     * 所有事件对象至少有下面的属性:
     * object - {Object} layer.events.object.
     * element - {DOMElement} layer.events.element.
     *
     * 支持的地图事件类型:
     * loadstart - 图层开始加载时触发.
     * loadend - 图层加载完成时触发.
     * visibilitychanged - 图层visibility发生改变时触发.
     * move - 图层移动时触发 (每次鼠标拖动时鼠标移动都会触发).
     * moveend - 图层移动完成时触发, 该事件同时传递一个包含 zoomChanged 布尔类型
     *     属性的对象,据此告之地图 zoom 已经发生变化.
     * added - 图层添加到地图时触发. 监听器将获得一个包含 map 以及 layer 引用的对
     *     象.
     * removed - 图层从地图删除时触发.监听器将获得一个包含 map 以及 layer 引用的对
     *     象.
     */
    events: null,

    /**
     * APIProperty: map
     * {<OpenLayers.Map>} 该变量在 layer 添加到 map 时, 经由 setMap 方法设置. 
     */
    map: null,
    
    /**
     * APIProperty: isBaseLayer
     * {Boolean} 图层是否为 base layer. 每个子类都应各自设置. 默认值为 false
     */
    isBaseLayer: false,
 
    /**
     * Property: alpha
     * {Boolean} 图层的 images 包含 alpha 通道. 默认值为 false. 
     */
    alpha: false,

    /** 
     * APIProperty: displayInLayerSwitcher
     * {Boolean} 在 layer switcher 中显示图层名称. 默认值为 true.
     */
    displayInLayerSwitcher: true,

    /**
     * APIProperty: visibility
     * {Boolean} 图层是否在 map 中显示. 默认值为 true.
     */
    visibility: true,

    /**
     * APIProperty: attribution
     * {String} 属性字符串 , 当 map 添加 <OpenLayers.Control.Attribution> 控
     *      件时显示.
     */
    attribution: null, 

    /** 
     * Property: inRange
     * {Boolean} 当前 map resolution 在图层的 min/max range之间. 这个值通过
     *     <OpenLayers.Map.setCenter>方法在每次 zoom 改变时被设置.
     */
    inRange: false,
    
    /**
     * Propery: imageSize
     * {<OpenLayers.Size>} 如果图层 gutter 值非0, 图片的宽高都将比 tile 的值大 
     * gutter 值的两倍.
     */
    imageSize: null,
    
  // OPTIONS

    /** 
     * Property: options
     * {Object} 一个 optional 对象它的属性将被设置到 layer 上.任何 layer 的属性
     *     都可以通过 layer 创建时的构造函数的 options 参数传递.
     */
    options: null,

    /**
     * APIProperty: eventListeners
     * {Object} 如果在构造时通过 options 设置, eventListeners 对象将通过
     *     <OpenLayers.Events.on> 被注册. 对象的结构必须是 events.on 方法示例里
     *     展示的那样的 listeners 对象.
     */
    eventListeners: null,

    /**
     * APIProperty: gutter
     * {Integer} 设置图片 tile 周围被忽略的 gutter 的宽度. 通过设置一个非0值,请求
     *     图片的大小的宽和高都比tile的值大 gutter 值的两倍.  This allows 
     *     artifacts of rendering at tile edges to be ignored. 设置 
     *     gutter的值为最宽symbol的一半. 默认为 zero. 非瓦片图层的 gutter 总为0.
     */ 
    gutter: 0, 

    /**
     * APIProperty: projection
     * {<OpenLayers.Projection>} or {<String>} 为 layer 指定一个projection .
     *     可以通过 layer 的 options 设置. 如果没有在 layer 的 options 中指定,
     *     当 layer 被添加至 map时, 它将被设置为 map 的默认 projection.
     *     商业 baselayers (Google,Bing 和 OpenStreetMap) 有默认的
     *     Projection (EPSG:3857), 以及 maxExtent 和 resolutions, 而不需要另
     *     行设置. 否则, 如果设置了 projection, 还需要适当的设置maxExtent,
     *     maxResolution 或者 resolutions.
     *     如果使用 vector layers with strategies, 如果 layer 数据源的 
     *     projection 与 map 默认的不同，则应该设置为数据源的 projection .
     * 
     *     可以是一个字符串或者一个 <OpenLayers.Projection> 对象; 如果传递的是字
     *     符串, 将在 layer 添加到 map 时被转换为对象.
     * 
     */
    projection: null,    
    
    /**
     * APIProperty: units
     * {String} 图层地图单位. 默认值为 null. 可能的单位有'degrees' (or 'dd'), 
     *     'm', 'ft', 'km', 'mi', 'inches'. 通常从 projection 获得.仅在map和
     *     layers 都没有定义 projection 时需要设置, 或者它们定义的 projection 都
     *     没有包含单位.
     */
    units: null,

    /**
     * APIProperty: scales
     * {Array} 降序排列的地图 scale 数组. 其中的数据为地图scale的分母. 注意这些值仅
     *     Note that these values only make sense if the display (monitor)
     *     resolution of the client is correctly guessed by whomever is 
     *     configuring the application. 另外, 属性 units 必须同时被设置.
     *     使用 <resolutions> 替代如果可能的话.
     */
    scales: null,

    /**
     * APIProperty: resolutions
     * {Array} 降序排列的地图 resolutions (map units per pixel). 如果 layer 
     *     的构造函数没有该属性的设置, 它将通过其它 resolution 相关属性计算设置 (
     *     maxExtent, maxResolution, maxScale, 等.).
     */
    resolutions: null,
    
    /**
     * APIProperty: maxExtent
     * {<OpenLayers.Bounds>|Array} 如果提供的是一个数组, 这个数组由4个值组成 (
     *     left, bottom, right, top).图层的最大范围. 默认为 null.
     * 
     *     The center of these bounds will not stray outside
     *     of the viewport extent during panning. 另外, 如果
     *     <displayOutsideMaxExtent> 设置为 false, 完全在maxExtent区域外的数
     *     据将不再被请求.
     */
    maxExtent: null,
    
    /**
     * APIProperty: minExtent
     * {<OpenLayers.Bounds>|Array} 如果提供的是一个数组, 这个数组由4个值组成 (
     *     left, bottom, right, top).图层的最小范围. 默认为 null.
     */
    minExtent: null,
    
    /**
     * APIProperty: maxResolution
     * {Float} 默认最大值为 360 deg / 256 px, 对应 gmaps 的0等级. 如果你不使用
     *     默认的 <OpenLayers.Map.tileSize> 显示整个世界.
     */
    maxResolution: null,

    /**
     * APIProperty: minResolution
     * {Float}
     */
    minResolution: null,

    /**
     * APIProperty: numZoomLevels
     * {Integer}
     */
    numZoomLevels: null,
    
    /**
     * APIProperty: minScale
     * {Float}
     */
    minScale: null,
    
    /**
     * APIProperty: maxScale
     * {Float}
     */
    maxScale: null,

    /**
     * APIProperty: displayOutsideMaxExtent
     * {Boolean} 为地图请求完全不在 max extent 内的 map tile. 默认为 false.
     */
    displayOutsideMaxExtent: false,

    /**
     * APIProperty: wrapDateLine
     * {Boolean} 在国际日期变更线连接世界, 这样的话地图可以在经度方向连续漫游. 只在
     * base layer使用, 而且仅当图层的 maxExtent 等于整个世界范围.
     * #487 for more info.   
     */
    wrapDateLine: false,
    
    /**
     * Property: metadata
     * {Object} 这个对象可以用来在 layer 上存储额外的信息.
     */
    metadata: null,
    
    /**
     * Constructor: OpenLayers.Layer
     *
     * Parameters:
     * name - {String} 图层名称
     * options - {Object} 图层 options
     */
    initialize: function(name, options) {

        this.metadata = {};
        
        this.addOptions(options);

        this.name = name;
        
        if (this.id == null) {

            this.id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");

            this.div = OpenLayers.Util.createDiv(this.id);
            this.div.style.width = "100%";
            this.div.style.height = "100%";
            this.div.dir = "ltr";

            this.events = new OpenLayers.Events(this, this.div);
            if(this.eventListeners instanceof Object) {
                this.events.on(this.eventListeners);
            }

        }
    },
    
    /**
     * Method: destroy
     * Destroy 是一个解构器: 它缓解javascript垃圾清理器无法处理循环引用的问题.
     *
     * Parameters:
     * setNewBaseLayer - {Boolean} Set a new base layer when this layer has
     *     been destroyed. 默认为 true.
     */
    destroy: function(setNewBaseLayer) {
        if (setNewBaseLayer == null) {
            setNewBaseLayer = true;
        }
        if (this.map != null) {
            this.map.removeLayer(this, setNewBaseLayer);
        }
        this.projection = null;
        this.map = null;
        this.name = null;
        this.div = null;
        this.options = null;

        if (this.events) {
            if(this.eventListeners) {
                this.events.un(this.eventListeners);
            }
            this.events.destroy();
        }
        this.eventListeners = null;
        this.events = null;
    },
    
   /**
    * Method: clone
    *
    * Parameters:
    * obj - {<OpenLayers.Layer>} 需要被克隆的对象
    *
    * Returns:
    * {<OpenLayers.Layer>} An exact clone of this <OpenLayers.Layer>
    */
    clone: function (obj) {
        
        if (obj == null) {
            obj = new OpenLayers.Layer(this.name, this.getOptions());
        }
        
        // catch any randomly tagged-on properties
        OpenLayers.Util.applyDefaults(obj, this);
        
        // a cloned layer should never have its map property set
        //  because it has not been added to a map yet. 
        obj.map = null;
        
        return obj;
    },
    
    /**
     * Method: getOptions
     * 从 layer 可选参数 options 中抽取属性，但其中已设置的属性，将使用已设置的值
     * 更新.
     * 
     * Returns:
     * {Object} 图层的 <options>, 描述当前状态.
     */
    getOptions: function() {
        var options = {};
        for(var o in this.options) {
            options[o] = this[o];
        }
        return options;
    },
    
    /** 
     * APIMethod: setName
     * 为 layer 设置新的名称. 该方法会触发 map 上的 changelayer 事件.
     *
     * Parameters:
     * newName - {String} 新的名称.
     */
    setName: function(newName) {
        if (newName != this.name) {
            this.name = newName;
            if (this.map != null) {
                this.map.events.triggerEvent("changelayer", {
                    layer: this,
                    property: "name"
                });
            }
        }
    },    
    
   /**
    * APIMethod: addOptions
    * 
    * Parameters:
    * newOptions - {Object}
    * reinitialize - {Boolean} 为 true 时, 如果当前baselayer的 resolution 
    *     options 发生改变, 地图将重新居中以确认其显示于一个合法的resolution, 并且
    *     触发一个 changebaselayer 事件.
    */
    addOptions: function (newOptions, reinitialize) {

        if (this.options == null) {
            this.options = {};
        }
        
        if (newOptions) {
            // make sure this.projection references a projection object
            if(typeof newOptions.projection == "string") {
                newOptions.projection = new OpenLayers.Projection(newOptions.projection);
            }
            if (newOptions.projection) {
                // get maxResolution(???有吗), units and maxExtent from projection defaults if
                // they are not defined already
                OpenLayers.Util.applyDefaults(newOptions,
                    OpenLayers.Projection.defaults[newOptions.projection.getCode()]);
            }
            // allow array for extents
            if (newOptions.maxExtent && !(newOptions.maxExtent instanceof OpenLayers.Bounds)) {
                newOptions.maxExtent = new OpenLayers.Bounds(newOptions.maxExtent);
            }
            if (newOptions.minExtent && !(newOptions.minExtent instanceof OpenLayers.Bounds)) {
                newOptions.minExtent = new OpenLayers.Bounds(newOptions.minExtent);
            }
        }

        // update our copy for clone
        OpenLayers.Util.extend(this.options, newOptions);

        // add new options to this
        OpenLayers.Util.extend(this, newOptions);
        
        // get the units from the projection, if we have a projection
        // and it it has units
        if(this.projection && this.projection.getUnits()) {
            this.units = this.projection.getUnits();
        }

        // re-initialize resolutions if necessary, i.e. if any of the
        // properties of the "properties" array defined below is set
        // in the new options
        if(this.map) {
            // store current resolution so we can try to restore it later
            var resolution = this.map.getResolution();
            var properties = this.RESOLUTION_PROPERTIES.concat(
                ["projection", "units", "minExtent", "maxExtent"]
            );
            for(var o in newOptions) {
                if(newOptions.hasOwnProperty(o) &&
                   OpenLayers.Util.indexOf(properties, o) >= 0) {

                    this.initResolutions();
                    if (reinitialize && this.map.baseLayer === this) {
                        // update map position, and restore previous resolution
                        this.map.setCenter(this.map.getCenter(),
                            this.map.getZoomForResolution(resolution),
                            false, true
                        );
                        // trigger a changebaselayer event to make sure that
                        // all controls (especially
                        // OpenLayers.Control.PanZoomBar) get notified of the
                        // new options
                        this.map.events.triggerEvent("changebaselayer", {
                            layer: this
                        });
                    }
                    break;
                }
            }
        }
    },

    /**
     * APIMethod: onMapResize
     * 该方法可以在子类中实现
     */
    onMapResize: function() {
        //this function can be implemented by subclasses  
    },

    /**
     * APIMethod: redraw
     * 重绘图层. 如果图层已经重绘返回 true，否则返回false。
     *
     * Returns:
     * {Boolean} 图层是否重绘.
     */
    redraw: function() {
        var redrawn = false;
        if (this.map) {

            // min/max Range may have changed
            this.inRange = this.calculateInRange();

            // map's center might not yet be set
            var extent = this.getExtent();

            if (extent && this.inRange && this.visibility) {
                var zoomChanged = true;
                this.moveTo(extent, zoomChanged, false);
                this.events.triggerEvent("moveend",
                    {"zoomChanged": zoomChanged});
                redrawn = true;
            }
        }
        return redrawn;
    },

    /**
     * Method: moveTo
     * map.moveTo 方法调用了该方法.
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * zoomChanged - {Boolean} zoom 是否发生变化.
     * dragging - {Boolean}
     */
    moveTo:function(bounds, zoomChanged, dragging) {
        var display = this.visibility;
        if (!this.isBaseLayer) {
            display = display && this.inRange;
        }
        this.display(display);
    },

    /**
     * Method: moveByPx
     * 基于像素移动图层. 供子类实现.
     *
     * Parameters:
     * dx - {Number} 水平位移.
     * dy - {Number} 垂直位移.
     */
    moveByPx: function(dx, dy) {
    },

    /**
     * Method: setMap
     * 为图层设置 map 属性. 这通过存取器（accessor）实现，所以子类可以复写这个方法并
     *     在添加 map 属性时做一些特殊的操作. 
     * 
     *     Here we take care to bring over any of the necessary default 
     *     properties from the map. 
     * 
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
    setMap: function(map) {
        if (this.map == null) {
        
            this.map = map;
            
            // grab some essential layer data from the map if it hasn't already
            //  been set
            this.maxExtent = this.maxExtent || this.map.maxExtent;
            this.minExtent = this.minExtent || this.map.minExtent;

            this.projection = this.projection || this.map.projection;
            if (typeof this.projection == "string") {
                this.projection = new OpenLayers.Projection(this.projection);
            }

            // Check the projection to see if we can get units -- if not, refer
            // to properties.
            this.units = this.projection.getUnits() ||
                         this.units || this.map.units;
            
            this.initResolutions();
            
            if (!this.isBaseLayer) {
                this.inRange = this.calculateInRange();
                var show = ((this.visibility) && (this.inRange));
                this.div.style.display = show ? "" : "none";
            }
            
            // deal with gutters
            this.setTileSize();
        }
    },
    
    /**
     * Method: afterAdd
     * 在 map.addLayer 方法处理过程的最后调用. 此时, 地图将包含一个 base layer.  
     * 该方法可以在子类中实现.
     */
    afterAdd: function() {
    },
    
    /**
     * APIMethod: removeMap
     * setMap() 允许图层在添加到 map 时做一些自定义操作, removeMap() 允许图层从地
     *     图删除时做一些自定义操作. 现在, 大多数时候不会用到, 除了 EventPane 
     *     layer, 它需要以此为钩子删除特定的隐藏的 pane. 
     * 在 map.removeLayer 方法中调用到此方法.
     * 该方法可以在子类中实现.
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
    removeMap: function(map) {
        //to be overridden by subclasses
    },
    
    /**
     * APIMethod: getImageSize
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>} 可选 tile bounds, 子类可以实现该方法以
     * 处理图层边缘处不同尺寸大小的tile (例如: Zoomify图层)
     * 
     * Returns:
     * {<OpenLayers.Size>} 图片应该的大小, 计入 gutter 的值.
     */ 
    getImageSize: function(bounds) { 
        return (this.imageSize || this.tileSize); 
    },    
  
    /**
     * APIMethod: setTileSize
     * Set the tile size based on the map size.  This also sets layer.imageSize
     *     or use by Tile.Image.
     * 
     * Parameters:
     * size - {<OpenLayers.Size>}
     */
    setTileSize: function(size) {
        var tileSize = (size) ? size :
                                ((this.tileSize) ? this.tileSize :
                                                   this.map.getTileSize());
        this.tileSize = tileSize;
        if(this.gutter) {
          // layers with gutters need non-null tile sizes
          //if(tileSize == null) {
          //    OpenLayers.console.error("Error in layer.setMap() for " +
          //                              this.name + ": layers with " +
          //                              "gutters need non-null tile sizes");
          //}
            this.imageSize = new OpenLayers.Size(tileSize.w + (2*this.gutter), 
                                                 tileSize.h + (2*this.gutter)); 
        }
    },

    /**
     * APIMethod: getVisibility
     * 
     * Returns:
     * {Boolean} 图层是否应该显示 (if in range).
     */
    getVisibility: function() {
        return this.visibility;
    },

    /** 
     * APIMethod: setVisibility
     * Set the visibility flag for the layer and hide/show & redraw 
     *     accordingly. Fire event unless otherwise specified
     * 
     * Note that visibility is no longer simply whether or not the layer's
     *     style.display is set to "block". 现在我们在layer类上存储一个'visibility' 状态
     *     属性, this allows us to remember whether or 
     *     not we *desire* for a layer to be visible. In the case where the 
     *     map's resolution is out of the layer's range, this desire may be 
     *     subverted.
     * 
     * Parameters:
     * visibility - {Boolean} Whether or not to display the layer (if in range)
     */
    setVisibility: function(visibility) {
        if (visibility != this.visibility) {
            this.visibility = visibility;
            this.display(visibility);
            this.redraw();
            if (this.map != null) {
                this.map.events.triggerEvent("changelayer", {
                    layer: this,
                    property: "visibility"
                });
            }
            this.events.triggerEvent("visibilitychanged");
        }
    },

    /** 
     * APIMethod: display
     * 隐藏或显示图层. 被设计用于内部使用, 一般不使用此途径激活或禁用 enable or 
     *     disable the layer. 为了达到此目的, 使用 setVisibility 方法代替.
     * 
     * Parameters:
     * display - {Boolean}
     */
    display: function(display) {
        if (display != (this.div.style.display != "none")) {
            this.div.style.display = (display && this.calculateInRange()) ? "block" : "none";
        }
    },

    /**
     * APIMethod: calculateInRange
     * 
     * Returns:
     * {Boolean} 当前地图 resolution 下图层是否显示. 注意如果 'alwaysInRange' 
     *     为 true ,这个方法将总是返回 true.
     */
    calculateInRange: function() {
        var inRange = false;

        if (this.alwaysInRange) {
            inRange = true;
        } else {
            if (this.map) {
                var resolution = this.map.getResolution();
                inRange = ( (resolution >= this.minResolution) &&
                            (resolution <= this.maxResolution) );
            }
        }
        return inRange;
    },

    /** 
     * APIMethod: setIsBaseLayer
     * 
     * Parameters:
     * isBaseLayer - {Boolean}
     */
    setIsBaseLayer: function(isBaseLayer) {
        if (isBaseLayer != this.isBaseLayer) {
            this.isBaseLayer = isBaseLayer;
            if (this.map != null) {
                this.map.events.triggerEvent("changebaselayer", {
                    layer: this
                });
            }
        }
    },

  /********************************************************/
  /*                                                      */
  /*                 Baselayer Functions                  */
  /*                                                      */
  /********************************************************/
  
    /** 
     * Method: initResolutions
     * 这个方法负责为 layer 设置 'resolutions' 数组 -- this array is what the 
     *     layer will use to interface
     *     between the zoom levels of the map and the resolution display 
     *     of the layer.
     * 
     * 用户有多个选项, 去决定如何设置该数组.
     *  
     * 更详细的论述, 请浏览 openlayers.org 的 wiki 主页:
     *     http://trac.openlayers.org/wiki/SettingZoomLevels
     */
    initResolutions: function() {

        // ok we want resolutions, here's our strategy:
        //
        // 1. if resolutions are defined in the layer config, use them
        // 2. else, if scales are defined in the layer config then derive
        //    resolutions from these scales
        // 3. else, attempt to calculate resolutions from maxResolution,
        //    minResolution, numZoomLevels, maxZoomLevel set in the
        //    layer config
        // 4. if we still don't have resolutions, and if resolutions
        //    are defined in the same, use them
        // 5. else, if scales are defined in the map then derive
        //    resolutions from these scales
        // 6. else, attempt to calculate resolutions from maxResolution,
        //    minResolution, numZoomLevels, maxZoomLevel set in the
        //    map
        // 7. hope for the best!

        var i, len, p;
        var props = {}, alwaysInRange = true;

        // get resolution data from layer config
        // (we also set alwaysInRange in the layer as appropriate)
        for(i=0, len=this.RESOLUTION_PROPERTIES.length; i<len; i++) {
            p = this.RESOLUTION_PROPERTIES[i];
            props[p] = this.options[p];
            if(alwaysInRange && this.options[p]) {
                alwaysInRange = false;
            }
        }
        if(this.alwaysInRange == null) {
            this.alwaysInRange = alwaysInRange;
        }

        // if we don't have resolutions then attempt to derive them from scales
        if(props.resolutions == null) {
            props.resolutions = this.resolutionsFromScales(props.scales);
        }

        // if we still don't have resolutions then attempt to calculate them
        if(props.resolutions == null) {
            props.resolutions = this.calculateResolutions(props);
        }

        // if we couldn't calculate resolutions then we look at we have
        // in the map
        if(props.resolutions == null) {
            for(i=0, len=this.RESOLUTION_PROPERTIES.length; i<len; i++) {
                p = this.RESOLUTION_PROPERTIES[i];
                props[p] = this.options[p] != null ?
                    this.options[p] : this.map[p];
            }
            if(props.resolutions == null) {
                props.resolutions = this.resolutionsFromScales(props.scales);
            }
            if(props.resolutions == null) {
                props.resolutions = this.calculateResolutions(props);
            }
        }

        // ok, we new need to set properties in the instance

        // get maxResolution from the config if it's defined there
        var maxResolution;
        if(this.options.maxResolution &&
           this.options.maxResolution !== "auto") {
            maxResolution = this.options.maxResolution;
        }
        if(this.options.minScale) {
            maxResolution = OpenLayers.Util.getResolutionFromScale(
                this.options.minScale, this.units);
        }

        // get minResolution from the config if it's defined there
        var minResolution;
        if(this.options.minResolution &&
           this.options.minResolution !== "auto") {
            minResolution = this.options.minResolution;
        }
        if(this.options.maxScale) {
            minResolution = OpenLayers.Util.getResolutionFromScale(
                this.options.maxScale, this.units);
        }

        if(props.resolutions) {

            //sort resolutions array descendingly
            props.resolutions.sort(function(a, b) {
                return (b - a);
            });

            // if we still don't have a maxResolution get it from the
            // resolutions array
            if(!maxResolution) {
                maxResolution = props.resolutions[0];
            }

            // if we still don't have a minResolution get it from the
            // resolutions array
            if(!minResolution) {
                var lastIdx = props.resolutions.length - 1;
                minResolution = props.resolutions[lastIdx];
            }
        }

        this.resolutions = props.resolutions;
        if(this.resolutions) {
            len = this.resolutions.length;
            this.scales = new Array(len);
            for(i=0; i<len; i++) {
                this.scales[i] = OpenLayers.Util.getScaleFromResolution(
                    this.resolutions[i], this.units);
            }
            this.numZoomLevels = len;
        }
        this.minResolution = minResolution;
        if(minResolution) {
            this.maxScale = OpenLayers.Util.getScaleFromResolution(
                minResolution, this.units);
        }
        this.maxResolution = maxResolution;
        if(maxResolution) {
            this.minScale = OpenLayers.Util.getScaleFromResolution(
                maxResolution, this.units);
        }
    },

    /**
     * Method: resolutionsFromScales
     * 从 scales 获取 resolutions.
     *
     * Parameters:
     * scales - {Array(Number)} Scales
     *
     * Returns
     * {Array(Number)} Resolutions
     */
    resolutionsFromScales: function(scales) {
        if(scales == null) {
            return;
        }
        var resolutions, i, len;
        len = scales.length;
        resolutions = new Array(len);
        for(i=0; i<len; i++) {
            resolutions[i] = OpenLayers.Util.getResolutionFromScale(
                scales[i], this.units);
        }
        return resolutions;
    },

    /**
     * Method: calculateResolutions
     * 基于相关属性计算 resolutions.
     *
     * Parameters:
     * props - {Object} 属性
     *
     * Returns:
     * {Array({Number})} resolutions 列表.
     */
    calculateResolutions: function(props) {

        var viewSize, wRes, hRes;

        // determine maxResolution
        var maxResolution = props.maxResolution;
        if(props.minScale != null) {
            maxResolution =
                OpenLayers.Util.getResolutionFromScale(props.minScale,
                                                       this.units);
        } else if(maxResolution == "auto" && this.maxExtent != null) {
            viewSize = this.map.getSize();
            wRes = this.maxExtent.getWidth() / viewSize.w;
            hRes = this.maxExtent.getHeight() / viewSize.h;
            maxResolution = Math.max(wRes, hRes);
        }

        // determine minResolution
        var minResolution = props.minResolution;
        if(props.maxScale != null) {
            minResolution =
                OpenLayers.Util.getResolutionFromScale(props.maxScale,
                                                       this.units);
        } else if(props.minResolution == "auto" && this.minExtent != null) {
            viewSize = this.map.getSize();
            wRes = this.minExtent.getWidth() / viewSize.w;
            hRes = this.minExtent.getHeight()/ viewSize.h;
            minResolution = Math.max(wRes, hRes);
        }

        if(typeof maxResolution !== "number" &&
           typeof minResolution !== "number" &&
           this.maxExtent != null) {
            // maxResolution for default grid sets assumes that at zoom
            // level zero, the whole world fits on one tile.
            var tileSize = this.map.getTileSize();
            maxResolution = Math.max(
                this.maxExtent.getWidth() / tileSize.w,
                this.maxExtent.getHeight() / tileSize.h
            );
        }

        // determine numZoomLevels
        var maxZoomLevel = props.maxZoomLevel;
        var numZoomLevels = props.numZoomLevels;
        if(typeof minResolution === "number" &&
           typeof maxResolution === "number" && numZoomLevels === undefined) {
            var ratio = maxResolution / minResolution;
            numZoomLevels = Math.floor(Math.log(ratio) / Math.log(2)) + 1;
        } else if(numZoomLevels === undefined && maxZoomLevel != null) {
            numZoomLevels = maxZoomLevel + 1;
        }

        // are we able to calculate resolutions?
        if(typeof numZoomLevels !== "number" || numZoomLevels <= 0 ||
           (typeof maxResolution !== "number" &&
                typeof minResolution !== "number")) {
            return;
        }

        // now we have numZoomLevels and at least one of maxResolution
        // or minResolution, we can populate the resolutions array

        var resolutions = new Array(numZoomLevels);
        var base = 2;
        if(typeof minResolution == "number" &&
           typeof maxResolution == "number") {
            // if maxResolution and minResolution are set, we calculate
            // the base for exponential scaling that starts at
            // maxResolution and ends at minResolution in numZoomLevels
            // steps.
            base = Math.pow(
                    (maxResolution / minResolution),
                (1 / (numZoomLevels - 1))
            );
        }

        var i;
        if(typeof maxResolution === "number") {
            for(i=0; i<numZoomLevels; i++) {
                resolutions[i] = maxResolution / Math.pow(base, i);
            }
        } else {
            for(i=0; i<numZoomLevels; i++) {
                resolutions[numZoomLevels - 1 - i] =
                    minResolution * Math.pow(base, i);
            }
        }

        return resolutions;
    },

    /**
     * APIMethod: getResolution
     * 
     * Returns:
     * {Float} 地图当前选中的 resolution, 以当前 zoom 等级为索引从 resolutions 
     * 数组获取.
     */
    getResolution: function() {
        var zoom = this.map.getZoom();
        return this.getResolutionForZoom(zoom);
    },

    /** 
     * APIMethod: getExtent
     * 
     * Returns:
     * {<OpenLayers.Bounds>} 返回一个描述当前视图经纬度范围季 Bounds 对象. 通过
     * 调用 map.calculateBounds() 实现.
     */
    getExtent: function() {
        // just use stock map calculateBounds function -- passing no arguments
        //  means it will user map's current center & resolution
        //
        return this.map.calculateBounds();
    },

    /**
     * APIMethod: getZoomForExtent
     * 
     * Parameters:
     * extent - {<OpenLayers.Bounds>}
     * closest - {Boolean} 找到与指定bounds最接近的zoom等级. 注意这可能导致某个
     *     zoom 不能完全包含整个extent.
     *     默认为 false.
     *
     * Returns:
     * {Integer} The index of the zoomLevel (entry in the resolutions array) 
     *     for the passed-in extent. 我们先通过地图 size 和 给定的 extent 计算
     *     理想的 resolution,然后调用 getZoomForResolution(), 并传递 
     *     'closest' 参数.
     */
    getZoomForExtent: function(extent, closest) {
        var viewSize = this.map.getSize();
        var idealResolution = Math.max( extent.getWidth()  / viewSize.w,
                                        extent.getHeight() / viewSize.h );

        return this.getZoomForResolution(idealResolution, closest);
    },
    
    /** 
     * Method: getDataExtent
     * 计算包含图层所有数据的最大范围.
     *     这个方法可以在子类中实现.
     * 
     * Returns:
     * {<OpenLayers.Bounds>}
     */
    getDataExtent: function () {
        //to be implemented by subclasses
    },

    /**
     * APIMethod: getResolutionForZoom
     * 
     * Parameters:
     * zoom - {Float}
     * 
     * Returns:
     * {Float} 与指定 zoom 匹配的 resolution.
     */
    getResolutionForZoom: function(zoom) {
        zoom = Math.max(0, Math.min(zoom, this.resolutions.length - 1));
        var resolution;
        if(this.map.fractionalZoom) {
            var low = Math.floor(zoom);
            var high = Math.ceil(zoom);
            resolution = this.resolutions[low] -
                ((zoom-low) * (this.resolutions[low]-this.resolutions[high]));
        } else {
            resolution = this.resolutions[Math.round(zoom)];
        }
        return resolution;
    },

    /**
     * APIMethod: getZoomForResolution
     * 
     * Parameters:
     * resolution - {Float}
     * closest - {Boolean} Find the zoom level that corresponds to the absolute 
     *     closest resolution, which may result in a zoom whose corresponding
     *     resolution is actually smaller than we would have desired (if this
     *     is being called from a getZoomForExtent() call, then this means that
     *     the returned zoom index might not actually contain the entire 
     *     extent specified... but it'll be close).
     *     默认为 false.
     * 
     * Returns:
     * {Integer} The index of the zoomLevel (entry in the resolutions array) 
     *     that corresponds to the best fit resolution given the passed in 
     *     value and the 'closest' specification.
     */
    getZoomForResolution: function(resolution, closest) {
        var zoom, i, len;
        if(this.map.fractionalZoom) {
            var lowZoom = 0;
            var highZoom = this.resolutions.length - 1;
            var highRes = this.resolutions[lowZoom];
            var lowRes = this.resolutions[highZoom];
            var res;
            for(i=0, len=this.resolutions.length; i<len; ++i) {
                res = this.resolutions[i];
                if(res >= resolution) {
                    highRes = res;
                    lowZoom = i;
                }
                if(res <= resolution) {
                    lowRes = res;
                    highZoom = i;
                    break;
                }
            }
            var dRes = highRes - lowRes;
            if(dRes > 0) {
                zoom = lowZoom + ((highRes - resolution) / dRes);
            } else {
                zoom = lowZoom;
            }
        } else {
            var diff;
            var minDiff = Number.POSITIVE_INFINITY;
            for(i=0, len=this.resolutions.length; i<len; i++) {            
                if (closest) {
                    diff = Math.abs(this.resolutions[i] - resolution);
                    if (diff > minDiff) {
                        break;
                    }
                    minDiff = diff;
                } else {
                    if (this.resolutions[i] < resolution) {
                        break;
                    }
                }
            }
            zoom = Math.max(0, i-1);
        }
        return zoom;
    },
    
    /**
     * APIMethod: getLonLatFromViewPortPx
     * 
     * Parameters:
     * viewPortPx - {<OpenLayers.Pixel>|Object} 一个OpenLayers.Pixel对象或
     * 包含 'x' 和 'y' 属性的对象.
     *
     * Returns:
     * {<OpenLayers.LonLat>} 经纬度位置.
     */
    getLonLatFromViewPortPx: function (viewPortPx) {
        var lonlat = null;
        var map = this.map;
        if (viewPortPx != null && map.minPx) {
            var res = map.getResolution();
            var maxExtent = map.getMaxExtent({restricted: true});
            var lon = (viewPortPx.x - map.minPx.x) * res + maxExtent.left;
            var lat = (map.minPx.y - viewPortPx.y) * res + maxExtent.top;
            lonlat = new OpenLayers.LonLat(lon, lat);

            if (this.wrapDateLine) {
                lonlat = lonlat.wrapDateLine(this.maxExtent);
            }
        }
        return lonlat;
    },

    /**
     * APIMethod: getViewPortPxFromLonLat
     * 经纬度转换为像素位置. 该方法范围带小数位的像素值.
     * 
     * Parameters:
     * lonlat - {<OpenLayers.LonLat>|Object} 一个OpenLayers.LonLat对象或包含
     * 'lon' 和 'lat' 属性的对象.
     *
     * Returns: 
     * {<OpenLayers.Pixel>} 像素位置.
     */
    getViewPortPxFromLonLat: function (lonlat, resolution) {
        var px = null; 
        if (lonlat != null) {
            resolution = resolution || this.map.getResolution();
            var extent = this.map.calculateBounds(null, resolution);
            px = new OpenLayers.Pixel(
                (1/resolution * (lonlat.lon - extent.left)),
                (1/resolution * (extent.top - lonlat.lat))
            );    
        }
        return px;
    },
    
    /**
     * APIMethod: setOpacity
     * 为整个图层设置透明度 (all images)，会触发changelayer事件
     * 
     * Parameters:
     * opacity - {Float}
     */
    setOpacity: function(opacity) {
        if (opacity != this.opacity) {
            this.opacity = opacity;
            var childNodes = this.div.childNodes;
            for(var i = 0, len = childNodes.length; i < len; ++i) {
                var element = childNodes[i].firstChild || childNodes[i];
                var lastChild = childNodes[i].lastChild;
                //TODO de-uglify this
                if (lastChild && lastChild.nodeName.toLowerCase() === "iframe") {
                    element = lastChild.parentNode;
                }
                OpenLayers.Util.modifyDOMElement(element, null, null, null, 
                                                 null, null, null, opacity);
            }
            if (this.map != null) {
                this.map.events.triggerEvent("changelayer", {
                    layer: this,
                    property: "opacity"
                });
            }
        }
    },

    /**
     * Method: getZIndex
     * 
     * Returns: 
     * {Integer} 图层的 z-index 值
     */    
    getZIndex: function () {
        return this.div.style.zIndex;
    },

    /**
     * Method: setZIndex
     * 设置图层的 z-index 值
     * Parameters: 
     * zIndex - {Integer}
     */    
    setZIndex: function (zIndex) {
        this.div.style.zIndex = zIndex;
    },

    /**
     * Method: adjustBounds
     * This function will take a bounds, and if wrapDateLine option is set
     *     on the layer, it will return a bounds which is wrapped around the 
     *     world. We do not wrap for bounds which *cross* the 
     *     maxExtent.left/right, only bounds which are entirely to the left 
     *     or entirely to the right.
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     */
    adjustBounds: function (bounds) {

        if (this.gutter) {
            // Adjust the extent of a bounds in map units by the 
            // layer's gutter in pixels.
            var mapGutter = this.gutter * this.map.getResolution();
            bounds = new OpenLayers.Bounds(bounds.left - mapGutter,
                                           bounds.bottom - mapGutter,
                                           bounds.right + mapGutter,
                                           bounds.top + mapGutter);
        }

        if (this.wrapDateLine) {
            // wrap around the date line, within the limits of rounding error
            var wrappingOptions = { 
                'rightTolerance':this.getResolution(),
                'leftTolerance':this.getResolution()
            };    
            bounds = bounds.wrapDateLine(this.maxExtent, wrappingOptions);
                              
        }
        return bounds;
    },

    CLASS_NAME: "OpenLayers.Layer"
});
