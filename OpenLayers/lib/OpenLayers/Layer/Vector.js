/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Layer.js
 * @requires OpenLayers/Renderer.js
 * @requires OpenLayers/StyleMap.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Console.js
 * @requires OpenLayers/Lang.js
 */

/**
 * Class: OpenLayers.Layer.Vector
 * OpenLayers.Layer.Vector 实例用于展示各种来源的矢量数据.
 *
 * Inherits from:
 *  - <OpenLayers.Layer>
 */
OpenLayers.Layer.Vector = OpenLayers.Class(OpenLayers.Layer, {

    /**
     * APIProperty: events
     * {<OpenLayers.Events>}
     *
     * Register a listener for a particular event with the following syntax:
     * (code)
     * layer.events.register(type, obj, listener);
     * (end)
     *
     * Listeners will be called with a reference to an event object.  The
     *     properties of this event depends on exactly what happened.
     *
     * All event objects have at least the following properties:
     * object - {Object} A reference to layer.events.object.
     * element - {DOMElement} A reference to layer.events.element.
     *
     * Supported map event types (in addition to those from <OpenLayers.Layer.events>):
     * beforefeatureadded - Triggered before a feature is added.  Listeners
     *      will receive an object with a *feature* property referencing the
     *      feature to be added.  To stop the feature from being added, a
     *      listener should return false.
     * beforefeaturesadded - Triggered before an array of features is added.
     *      Listeners will receive an object with a *features* property
     *      referencing the feature to be added. To stop the features from
     *      being added, a listener should return false.
     * featureadded - Triggered after a feature is added.  The event
     *      object passed to listeners will have a *feature* property with a
     *      reference to the added feature.
     * featuresadded - Triggered after features are added.  The event
     *      object passed to listeners will have a *features* property with a
     *      reference to an array of added features.
     * beforefeatureremoved - Triggered before a feature is removed. Listeners
     *      will receive an object with a *feature* property referencing the
     *      feature to be removed.
     * beforefeaturesremoved - Triggered before multiple features are removed. 
     *      Listeners will receive an object with a *features* property
     *      referencing the features to be removed.
     * featureremoved - Triggerd after a feature is removed. The event
     *      object passed to listeners will have a *feature* property with a
     *      reference to the removed feature.
     * featuresremoved - Triggered after features are removed. The event
     *      object passed to listeners will have a *features* property with a
     *      reference to an array of removed features.
     * beforefeatureselected - Triggered before a feature is selected.  Listeners
     *      will receive an object with a *feature* property referencing the
     *      feature to be selected. To stop the feature from being selectd, a
     *      listener should return false.
     * featureselected - Triggered after a feature is selected.  Listeners
     *      will receive an object with a *feature* property referencing the
     *      selected feature.
     * featureunselected - Triggered after a feature is unselected.
     *      Listeners will receive an object with a *feature* property
     *      referencing the unselected feature.
     * beforefeaturemodified - Triggered when a feature is selected to 
     *      be modified.  Listeners will receive an object with a *feature* 
     *      property referencing the selected feature.
     * featuremodified - Triggered when a feature has been modified.
     *      Listeners will receive an object with a *feature* property referencing 
     *      the modified feature.
     * afterfeaturemodified - Triggered when a feature is finished being modified.
     *      Listeners will receive an object with a *feature* property referencing 
     *      the modified feature.
     * vertexmodified - Triggered when a vertex within any feature geometry
     *      has been modified.  Listeners will receive an object with a
     *      *feature* property referencing the modified feature, a *vertex*
     *      property referencing the vertex modified (always a point geometry),
     *      and a *pixel* property referencing the pixel location of the
     *      modification.
     * vertexremoved - Triggered when a vertex within any feature geometry
     *      has been deleted.  Listeners will receive an object with a
     *      *feature* property referencing the modified feature, a *vertex*
     *      property referencing the vertex modified (always a point geometry),
     *      and a *pixel* property referencing the pixel location of the
     *      removal.
     * sketchstarted - Triggered when a feature sketch bound for this layer
     *      is started.  Listeners will receive an object with a *feature*
     *      property referencing the new sketch feature and a *vertex* property
     *      referencing the creation point.
     * sketchmodified - Triggered when a feature sketch bound for this layer
     *      is modified.  Listeners will receive an object with a *vertex*
     *      property referencing the modified vertex and a *feature* property
     *      referencing the sketch feature.
     * sketchcomplete - Triggered when a feature sketch bound for this layer
     *      is complete.  Listeners will receive an object with a *feature*
     *      property referencing the sketch feature.  By returning false, a
     *      listener can stop the sketch feature from being added to the layer.
     * refresh - Triggered when something wants a strategy to ask the protocol
     *      for a new set of features.
     */

    /**
     * APIProperty: isBaseLayer
     * {Boolean} 图层是否为底图. 默认为 false. 通过图层options设置.
     */
    isBaseLayer: false,

    /** 
     * APIProperty: isFixed
     * {Boolean} 拖动地图时图层是否停留在原地.Whether the layer remains in 
     * one place while dragging the map.
     */
    isFixed: false,

    /** 
     * APIProperty: features
     * {Array(<OpenLayers.Feature.Vector>)} 图层上矢量元素集合
     */
    features: null,
    
    /** 
     * Property: filter
     * {<OpenLayers.Filter>} The filter set in this layer,
     *     a strategy launching read requests can combined
     *     this filter with its own filter.
     */
    filter: null,
    
    /** 
     * Property: selectedFeatures
     * {Array(<OpenLayers.Feature.Vector>)} 图层上被选中的元素
     */
    selectedFeatures: null,
    
    /**
     * Property: unrenderedFeatures
     * {Object} 呈现失败的元素id集合.hash of features, keyed by feature.id, 
     * that the renderer failed to draw
     */
    unrenderedFeatures: null,

    /**
     * APIProperty: reportError
     * {Boolean} 友好的展示图层呈现时的错误信息.report friendly error message 
     * when loading of renderer
     * fails.
     */
    reportError: true, 

    /** 
     * APIProperty: style
     * {Object} 图层的默认样式. Default style for the layer
     */
    style: null,
    
    /**
     * Property: styleMap
     * {<OpenLayers.StyleMap>} 图层样式字典
     */
    styleMap: null,
    
    /**
     * Property: strategies
     * {Array(<OpenLayers.Strategy>})} Optional list of strategies for the layer.
     */
    strategies: null,
    
    /**
     * Property: protocol
     * {<OpenLayers.Protocol>} Optional protocol for the layer.
     */
    protocol: null,
    
    /**
     * Property: renderers
     * {Array(String)} 被支持的Renderer类数组. Add to this list to
     * add support for additional renderers. 如果renderer属性没有设置的话,
     * 这个列表中的第一个supported方法能返回true的renderers将被用来设置renderer
     * 属性.
     */
    renderers: ['SVG', 'VML', 'Canvas'],
    
    /** 
     * Property: renderer
     * {<OpenLayers.Renderer>}
     */
    renderer: null,
    
    /**
     * APIProperty: rendererOptions
     * {Object} Options for the renderer. See {<OpenLayers.Renderer>} for
     *     supported options.
     */
    rendererOptions: null,
    
    /** 
     * APIProperty: geometryType
     * {String} 该属性可以用于限制图层支持的几何元素类型. 应该设置像
     * "OpenLayers.Geometry.Point"这样的值来达成限制目的. geometryType allows 
     * you to limit the types of geometries this layer supports. This 
     * should be set to something like "OpenLayers.Geometry.Point" to 
     * limit types.
     */
    geometryType: null,

    /** 
     * Property: drawn
     * {Boolean} 矢量图层元素是否已经绘制.Whether the Vector Layer features 
     * have been drawn yet.
     */
    drawn: false,
    
    /** 
     * APIProperty: ratio
     * {Float} This specifies the ratio of the size of the visiblity of the Vector Layer features to the size of the map.
     */   
    ratio: 1,

    /**
     * Constructor: OpenLayers.Layer.Vector
     * [override]创建一个矢量图层
     *
     * Parameters:
     * name - {String} 图层名称
     * options - {Object} Optional object with non-default properties to set on
     *           the layer.
     *
     * Returns:
     * {<OpenLayers.Layer.Vector>} 新的矢量图层
     */
    initialize: function(name, options) {
        OpenLayers.Layer.prototype.initialize.apply(this, arguments);

        // allow user-set renderer, otherwise assign one
        if (!this.renderer || !this.renderer.supported()) {  
            this.assignRenderer();
        }

        // if no valid renderer found, display error
        if (!this.renderer || !this.renderer.supported()) {
            this.renderer = null;
            this.displayError();
        } 

        if (!this.styleMap) {
            this.styleMap = new OpenLayers.StyleMap();
        }

        this.features = [];
        this.selectedFeatures = [];
        this.unrenderedFeatures = {};
        
        // Allow for custom layer behavior
        if(this.strategies){
            for(var i=0, len=this.strategies.length; i<len; i++) {
                this.strategies[i].setLayer(this);
            }
        }

    },

    /**
     * APIMethod: destroy
     * 销毁图层
     */
    destroy: function() {
        if (this.strategies) {
            var strategy, i, len;
            for(i=0, len=this.strategies.length; i<len; i++) {
                strategy = this.strategies[i];
                if(strategy.autoDestroy) {
                    strategy.destroy();
                }
            }
            this.strategies = null;
        }
        if (this.protocol) {
            if(this.protocol.autoDestroy) {
                this.protocol.destroy();
            }
            this.protocol = null;
        }
        this.destroyFeatures();
        this.features = null;
        this.selectedFeatures = null;
        this.unrenderedFeatures = null;
        if (this.renderer) {
            this.renderer.destroy();
        }
        this.renderer = null;
        this.geometryType = null;
        this.drawn = null;
        OpenLayers.Layer.prototype.destroy.apply(this, arguments);  
    },

    /**
     * Method: clone
     * 创建该图层的克隆.
     * 
     * 注意: 该图层上的元素也将被克隆.
     *
     * Returns:
     * {<OpenLayers.Layer.Vector>} 图层的克隆
     */
    clone: function (obj) {
        
        if (obj == null) {
            obj = new OpenLayers.Layer.Vector(this.name, this.getOptions());
        }

        //get all additions from superclasses
        obj = OpenLayers.Layer.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here
        var features = this.features;
        var len = features.length;
        var clonedFeatures = new Array(len);
        for(var i=0; i<len; ++i) {
            clonedFeatures[i] = features[i].clone();
        }
        obj.features = clonedFeatures;

        return obj;
    },    
    
    /**
     * Method: refresh
     * 使图层再次请求元素(数据)并重绘元素.如果图层在显示范围且可见,将触发 refresh 
     * 事件.
     *
     * Parameters:
     * obj - {Object} Optional object with properties for any listener of
     *     the refresh event.
     */
    refresh: function(obj) {
        if(this.calculateInRange() && this.visibility) {
            this.events.triggerEvent("refresh", obj);
        }
    },

    /** 
     * Method: assignRenderer
     * 遍历renderers,从中获取第一个可用且支持(浏览器支持)的renderer,并设置
     * renderer属性.
     */    
    assignRenderer: function()  {
        for (var i=0, len=this.renderers.length; i<len; i++) {
            var rendererClass = this.renderers[i];
            var renderer = (typeof rendererClass == "function") ?
                rendererClass :
                OpenLayers.Renderer[rendererClass];
            if (renderer && renderer.prototype.supported()) {
                this.renderer = new renderer(this.div, this.rendererOptions);
                break;
            }  
        }  
    },

    /** 
     * Method: displayError 
     * 告诉用户他的浏览器不被支持.
     */
    displayError: function() {
        if (this.reportError) {
            OpenLayers.Console.userError(OpenLayers.i18n("browserNotSupported", 
                                     {renderers: this. renderers.join('\n')}));
        }    
    },

    /** 
     * Method: setMap
     * The layer has been added to the map. 
     * 
     * 如果没有设置renderer, 图层不能使用, 删除之(map.removeLayer). 如果设置了
     * renderer,将为renderer添加map的引用并设置其size,具体见源码.
     * 
     * Parameters:
     * map - {<OpenLayers.Map>} 
     */
    setMap: function(map) {        
        OpenLayers.Layer.prototype.setMap.apply(this, arguments);

        if (!this.renderer) {
            this.map.removeLayer(this);
        } else {
            this.renderer.map = this.map;

            var newSize = this.map.getSize();
            newSize.w = newSize.w * this.ratio;
            newSize.h = newSize.h * this.ratio;
            this.renderer.setSize(newSize);
        }
    },

    /**
     * Method: afterAdd
     * 在 map.addLayer 方法处理过程的最后调用. 此时, 地图将包含一个 base layer.
     * 所有自动激活的策略(strategies)都在自处被激活.
     */
    afterAdd: function() {
        if(this.strategies) {
            var strategy, i, len;
            for(i=0, len=this.strategies.length; i<len; i++) {
                strategy = this.strategies[i];
                if(strategy.autoActivate) {
                    strategy.activate();
                }
            }
        }
    },

    /**
     * Method: removeMap
     * The layer has been removed from the map. 这里将禁用所有strategies并将
     * drawn属性设置为false.
     *
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
    removeMap: function(map) {
        this.drawn = false;
        if(this.strategies) {
            var strategy, i, len;
            for(i=0, len=this.strategies.length; i<len; i++) {
                strategy = this.strategies[i];
                if(strategy.autoActivate) {
                    strategy.deactivate();
                }
            }
        }
    },
    
    /**
     * Method: onMapResize
     * 此处注意 renderer 的 size 变化. map 大小的变化会影响renderer大小.参考属性
     * ratio.
     * 
     */
    onMapResize: function() {
        OpenLayers.Layer.prototype.onMapResize.apply(this, arguments);
        
        var newSize = this.map.getSize();
        newSize.w = newSize.w * this.ratio;
        newSize.h = newSize.h * this.ratio;
        this.renderer.setSize(newSize);
    },

    /**
     * Method: moveTo
     *  Reset the vector layer's div so that it once again is lined up with 
     *   the map. Notify the renderer of the change of extent, and in the
     *   case of a change of zoom level (resolution), have the 
     *   renderer redraw features.
     * 
     *  If the layer has not yet been drawn, cycle through the layer's 
     *   features and draw each one.
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>} 
     * zoomChanged - {Boolean} 
     * dragging - {Boolean} 
     */
    moveTo: function(bounds, zoomChanged, dragging) {
        OpenLayers.Layer.prototype.moveTo.apply(this, arguments);
        
        var coordSysUnchanged = true;
        if (!dragging) {
            this.renderer.root.style.visibility = 'hidden';

            var viewSize = this.map.getSize(),
                viewWidth = viewSize.w,
                viewHeight = viewSize.h,
                offsetLeft = (viewWidth / 2 * this.ratio) - viewWidth / 2,
                offsetTop = (viewHeight / 2 * this.ratio) - viewHeight / 2;
            offsetLeft += parseInt(this.map.layerContainerDiv.style.left, 10);
            offsetLeft = -Math.round(offsetLeft);
            offsetTop += parseInt(this.map.layerContainerDiv.style.top, 10);
            offsetTop = -Math.round(offsetTop);

            this.div.style.left = offsetLeft + 'px';
            this.div.style.top = offsetTop + 'px';

            var extent = this.map.getExtent().scale(this.ratio);
            coordSysUnchanged = this.renderer.setExtent(extent, zoomChanged);

            this.renderer.root.style.visibility = 'visible';

            // Force a reflow on gecko based browsers to prevent jump/flicker.
            // This seems to happen on only certain configurations; it was originally
            // noticed in FF 2.0 and Linux.
            if (OpenLayers.IS_GECKO === true) {
                this.div.scrollLeft = this.div.scrollLeft;
            }
            
            if (!zoomChanged && coordSysUnchanged) {
                for (var i in this.unrenderedFeatures) {
                    var feature = this.unrenderedFeatures[i];
                    this.drawFeature(feature);
                }
            }
        }
        if (!this.drawn || zoomChanged || !coordSysUnchanged) {
            this.drawn = true;
            var feature;
            for(var i=0, len=this.features.length; i<len; i++) {
                this.renderer.locked = (i !== (len - 1));
                feature = this.features[i];
                this.drawFeature(feature);
            }
        }    
    },
    
    /** 
     * APIMethod: display
     * Hide or show the Layer
     * 
     * Parameters:
     * display - {Boolean}
     */
    display: function(display) {
        OpenLayers.Layer.prototype.display.apply(this, arguments);
        // we need to set the display style of the root in case it is attached
        // to a foreign layer
        var currentDisplay = this.div.style.display;
        if(currentDisplay != this.renderer.root.style.display) {
            this.renderer.root.style.display = currentDisplay;
        }
    },

    /**
     * APIMethod: addFeatures
     * 添加元素到图层.
     *
     * Parameters:
     * features - {Array(<OpenLayers.Feature.Vector>)} 元素集合或元素
     * options - {Object}
     */
    addFeatures: function(features, options) {
        if (!(OpenLayers.Util.isArray(features))) {
            features = [features];
        }
        
        var notify = !options || !options.silent;
        if(notify) {
            var event = {features: features};
            var ret = this.events.triggerEvent("beforefeaturesadded", event);
            if(ret === false) {
                return;
            }
            features = event.features;
        }
        
        // Track successfully added features for featuresadded event, since
        // beforefeatureadded can veto single features.
        var featuresAdded = [];
        for (var i=0, len=features.length; i<len; i++) {
            if (i != (features.length - 1)) {
                this.renderer.locked = true;
            } else {
                this.renderer.locked = false;
            }    
            var feature = features[i];
            
            if (this.geometryType &&
              !(feature.geometry instanceof this.geometryType)) {
                throw new TypeError('addFeatures: component should be an ' +
                                    this.geometryType.prototype.CLASS_NAME);
              }

            //give feature reference to its layer
            feature.layer = this;

            if (!feature.style && this.style) {
                feature.style = OpenLayers.Util.extend({}, this.style);
            }

            if (notify) {
                if(this.events.triggerEvent("beforefeatureadded",
                                            {feature: feature}) === false) {
                    continue;
                }
                this.preFeatureInsert(feature);
            }

            featuresAdded.push(feature);
            this.features.push(feature);
            this.drawFeature(feature);
            
            if (notify) {
                this.events.triggerEvent("featureadded", {
                    feature: feature
                });
                this.onFeatureInsert(feature);
            }
        }
        
        if(notify) {
            this.events.triggerEvent("featuresadded", {features: featuresAdded});
        }
    },


    /**
     * APIMethod: removeFeatures
     * 从图层删除元素. 删除所有已绘制的features并从图层控件上移除它们.
     *     beforefeatureremoved 和 featureremoved 事件将在每个feature上触发. 
     *     featuresremoved 事件将在所有features删除后触发. 禁止事件触发请使用
     *     silent 选项.
     * 
     * Parameters:
     * features - {Array(<OpenLayers.Feature.Vector>)} List of features to be
     *     removed.
     * options - {Object} Optional properties for changing behavior of the
     *     removal.
     *
     * Valid options:
     * silent - {Boolean} 禁止事件触发. 默认为 false.
     */
    removeFeatures: function(features, options) {
        if(!features || features.length === 0) {
            return;
        }
        if (features === this.features) {
            return this.removeAllFeatures(options);
        }
        if (!(OpenLayers.Util.isArray(features))) {
            features = [features];
        }
        if (features === this.selectedFeatures) {
            features = features.slice();
        }

        var notify = !options || !options.silent;
        
        if (notify) {
            this.events.triggerEvent(
                "beforefeaturesremoved", {features: features}
            );
        }

        for (var i = features.length - 1; i >= 0; i--) {
            // We remain locked so long as we're not at 0
            // and the 'next' feature has a geometry. We do the geometry check
            // because if all the features after the current one are 'null', we
            // won't call eraseGeometry, so we break the 'renderer functions
            // will always be called with locked=false *last*' rule. The end result
            // is a possible gratiutious unlocking to save a loop through the rest 
            // of the list checking the remaining features every time. So long as
            // null geoms are rare, this is probably okay.    
            if (i != 0 && features[i-1].geometry) {
                this.renderer.locked = true;
            } else {
                this.renderer.locked = false;
            }
    
            var feature = features[i];
            delete this.unrenderedFeatures[feature.id];

            if (notify) {
                this.events.triggerEvent("beforefeatureremoved", {
                    feature: feature
                });
            }

            this.features = OpenLayers.Util.removeItem(this.features, feature);
            // feature has no layer at this point
            feature.layer = null;

            if (feature.geometry) {
                this.renderer.eraseFeatures(feature);
            }
                    
            //in the case that this feature is one of the selected features, 
            // remove it from that array as well.
            if (OpenLayers.Util.indexOf(this.selectedFeatures, feature) != -1){
                OpenLayers.Util.removeItem(this.selectedFeatures, feature);
            }

            if (notify) {
                this.events.triggerEvent("featureremoved", {
                    feature: feature
                });
            }
        }

        if (notify) {
            this.events.triggerEvent("featuresremoved", {features: features});
        }
    },
    
    /** 
     * APIMethod: removeAllFeatures
     * 从图层删除所有features.
     *
     * Parameters:
     * options - {Object} Optional properties for changing behavior of the
     *     removal.
     *
     * Valid options:
     * silent - {Boolean} 禁止事件触发. 默认为 false.
     */
    removeAllFeatures: function(options) {
        var notify = !options || !options.silent;
        var features = this.features;
        if (notify) {
            this.events.triggerEvent(
                "beforefeaturesremoved", {features: features}
            );
        }
        var feature;
        for (var i = features.length-1; i >= 0; i--) {
            feature = features[i];
            if (notify) {
                this.events.triggerEvent("beforefeatureremoved", {
                    feature: feature
                });
            }
            feature.layer = null;
            if (notify) {
                this.events.triggerEvent("featureremoved", {
                    feature: feature
                });
            }
        }
        this.renderer.clear();
        this.features = [];
        this.unrenderedFeatures = {};
        this.selectedFeatures = [];
        if (notify) {
            this.events.triggerEvent("featuresremoved", {features: features});
        }
    },

    /**
     * APIMethod: destroyFeatures
     * 擦除并销毁图层上的 features.
     *
     * Parameters:
     * features - {Array(<OpenLayers.Feature.Vector>)} An optional array of
     *     features to destroy.  If not supplied, all features on the layer
     *     will be destroyed.
     * options - {Object}
     */
    destroyFeatures: function(features, options) {
        var all = (features == undefined); // evaluates to true if
                                           // features is null
        if(all) {
            features = this.features;
        }
        if(features) {
            this.removeFeatures(features, options);
            for(var i=features.length-1; i>=0; i--) {
                features[i].destroy();
            }
        }
    },

    /**
     * APIMethod: drawFeature
     * 绘制 (或者重绘) 涂层上的一个元素. 如果提供了style参数,哪使用这个样式. 如果没
     * 有包含style参数,元素的style将被使用.如果元素没有style,则使用图层的style.
     * 
     * 这个方法不是被设计用来添加元素到图层的(使用addFeatures). 
     * It is meant to be used when
     * the style of a feature has changed, or in some other way needs to 
     * visually updated *after* it has already been added to a layer. You
     * must add the feature to the layer for most layer-related events to 
     * happen.
     *
     * Parameters: 
     * feature - {<OpenLayers.Feature.Vector>} 
     * style - {String | Object} Named render intent or full symbolizer object.
     */
    drawFeature: function(feature, style) {
        // don't try to draw the feature with the renderer if the layer is not 
        // drawn itself
        if (!this.drawn) {
            return;
        }
        if (typeof style != "object") {
            if(!style && feature.state === OpenLayers.State.DELETE) {
                style = "delete";
            }
            var renderIntent = style || feature.renderIntent;
            style = feature.style || this.style;
            if (!style) {
                style = this.styleMap.createSymbolizer(feature, renderIntent);
            }
        }
        
        var drawn = this.renderer.drawFeature(feature, style);
        //TODO remove the check for null when we get rid of Renderer.SVG
        if (drawn === false || drawn === null) {
            this.unrenderedFeatures[feature.id] = feature;
        } else {
            delete this.unrenderedFeatures[feature.id];
        }
    },
    
    /**
     * Method: eraseFeatures
     * 从图层擦除元素.Erase features from the layer.
     *
     * Parameters:
     * features - {Array(<OpenLayers.Feature.Vector>)} 
     */
    eraseFeatures: function(features) {
        this.renderer.eraseFeatures(features);
    },

    /**
     * Method: getFeatureFromEvent
     * 从event对象上获取feature.如果event发生在某个feature上的话.否则返回null.
     *
     * Parameters:
     * evt - {Event} 
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} A feature if one was under the event.
     */
    getFeatureFromEvent: function(evt) {
        if (!this.renderer) {
            throw new Error('getFeatureFromEvent called on layer with no ' +
                            'renderer. This usually means you destroyed a ' +
                            'layer, but not some handler which is associated ' +
                            'with it.');
        }
        var feature = null;
        var featureId = this.renderer.getFeatureIdFromEvent(evt);
        if (featureId) {
            if (typeof featureId === "string") {
                feature = this.getFeatureById(featureId);
            } else {
                feature = featureId;
            }
        }
        return feature;
    },

    /**
     * APIMethod: getFeatureBy
     * Given a property value, return the feature if it exists in the features array
     *
     * Parameters:
     * property - {String}
     * value - {String}
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} A feature corresponding to the given
     * property value or null if there is no such feature.
     */
    getFeatureBy: function(property, value) {
        //TBD - would it be more efficient to use a hash for this.features?
        var feature = null;
        for(var i=0, len=this.features.length; i<len; ++i) {
            if(this.features[i][property] == value) {
                feature = this.features[i];
                break;
            }
        }
        return feature;
    },

    /**
     * APIMethod: getFeatureById
     * Given a feature id, return the feature if it exists in the features array
     *
     * Parameters:
     * featureId - {String}
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} A feature corresponding to the given
     * featureId or null if there is no such feature.
     */
    getFeatureById: function(featureId) {
        return this.getFeatureBy('id', featureId);
    },

    /**
     * APIMethod: getFeatureByFid
     * Given a feature fid, return the feature if it exists in the features array
     *
     * Parameters:
     * featureFid - {String}
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} A feature corresponding to the given
     * featureFid or null if there is no such feature.
     */
    getFeatureByFid: function(featureFid) {
        return this.getFeatureBy('fid', featureFid);
    },
    
    /**
     * APIMethod: getFeaturesByAttribute
     * Returns an array of features that have the given attribute key set to the
     * given value. Comparison of attribute values takes care of datatypes, e.g.
     * the string '1234' is not equal to the number 1234.
     *
     * Parameters:
     * attrName - {String}
     * attrValue - {Mixed}
     *
     * Returns:
     * Array({<OpenLayers.Feature.Vector>}) 满足条件的元素数组.
     */
    getFeaturesByAttribute: function(attrName, attrValue) {
        var i,
            feature,    
            len = this.features.length,
            foundFeatures = [];
        for(i = 0; i < len; i++) {            
            feature = this.features[i];
            if(feature && feature.attributes) {
                if (feature.attributes[attrName] === attrValue) {
                    foundFeatures.push(feature);
                }
            }
        }
        return foundFeatures;
    },

    /**
     * Unselect the selected features
     * i.e. clears the featureSelection array
     * change the style back
    clearSelection: function() {

       var vectorLayer = this.map.vectorLayer;
        for (var i = 0; i < this.map.featureSelection.length; i++) {
            var featureSelection = this.map.featureSelection[i];
            vectorLayer.drawFeature(featureSelection, vectorLayer.style);
        }
        this.map.featureSelection = [];
    },
     */


    /**
     * APIMethod: onFeatureInsert
     * 一个元素添加之后调用的方法.默认什么也不做.用户可以重写该方法.
     *
     * Parameters: 
     * feature - {<OpenLayers.Feature.Vector>} 
     */
    onFeatureInsert: function(feature) {
    },
    
    /**
     * APIMethod: preFeatureInsert
     * 一个元素添加之前调用的方法.默认什么也不做.如果需要在元素首次被添加到图层时对元
     * 素做些什么操作的话,用户可以重写该方法, but before they are drawn, such 
     * as adjust the style.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} 
     */
    preFeatureInsert: function(feature) {
    },

    /** 
     * APIMethod: getDataExtent
     * 计算包含所有元素的最小范围.
     * 
     * Returns:
     * {<OpenLayers.Bounds>}对象 或 null 如果图层没有包含geometry的元素时.
     */
    getDataExtent: function () {
        var maxExtent = null;
        var features = this.features;
        if(features && (features.length > 0)) {
            var geometry = null;
            for(var i=0, len=features.length; i<len; i++) {
                geometry = features[i].geometry;
                if (geometry) {
                    if (maxExtent === null) {
                        maxExtent = new OpenLayers.Bounds();
                    }
                    maxExtent.extend(geometry.getBounds());
                }
            }
        }
        return maxExtent;
    },

    CLASS_NAME: "OpenLayers.Layer.Vector"
});
