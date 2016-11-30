/**
 * @requires http://172.16.60.32/OpenLayers-2.12/lib/OpenLayers.js
 * @requires resources/map/openlayers/ExSelectFeature.js
 * @requires resources/map/openlayers/GMapLayer.js 模块: mapModule
 *           OpenLayers部分功能封装为jquery组件，提供方法、属性、事件 Parameters: options - {Object}
 */
/**
 * mapModule类
 * @author 许照云
 * 2013.5
 */
$.fn.mapModule =
    function(options) {
        var ele = $(this);
        var layerUrl = options.layerUrl;//矢量图层的url地址
        var mapUrl = options.mapUrl;
        var extent = options.extent;
        var persist = options.persist; // 绘制内容是否保留(可选参数)
        var styleMap = options.styleMap; // 用于定制地图要素的样式
        var clickout = options.clickout;
        var default_graphic = options.default_graphic;// {string}
        // 要素在默认状态下的图标的url地址
        var select_graphic = options.select_graphic;// {string}
        // 要素在选中状态下的图标的url地址
        var sides = parseInt(options.sides);
        var radius = parseFloat(options.radius);
        // var angle = parseFloat(options.angle);
        var origin = options.origin; // OpenLayers.Geometry.Point
        var fixedRadius = options.fixedRadius;
        
        var panel = options.panel;

        var myStyleMap = undefined;

        // 应用openlayers的OpenLayers.Feature.Vector.style，避免复制造成引用传递会影响其值
        var temp_style1 =
            {
                'default' : OpenLayers.Util.extend({},
                    OpenLayers.Feature.Vector.style['default']),
                'select' : OpenLayers.Util.extend({},
                    OpenLayers.Feature.Vector.style['select']),
                'temporary' : OpenLayers.Util.extend({},
                    OpenLayers.Feature.Vector.style['temporary']),
                'delete' : OpenLayers.Util.extend({},
                    OpenLayers.Feature.Vector.style['delete'])
            };
        if (default_graphic) {
        	var default_style = null;
        	if(default_graphic == 'none'){
        		default_style =
                    OpenLayers.Util.extend(temp_style1['default'], {
                        graphic : false
                    });
        	}else{
        		default_style =
                    OpenLayers.Util.extend(temp_style1['default'], {
                        graphic : true,
                        graphicOpacity : 1,
                        externalGraphic : default_graphic,
                        graphicWidth : 32
                    });
        	}         
            if (select_graphic) {
                var select_style =
                    OpenLayers.Util.extend(temp_style1['select'], {
                        graphic : true,
                        graphicOpacity : 1,
                        externalGraphic : select_graphic,
                        graphicWidth : 32
                    });
                var style = OpenLayers.Util.extend(temp_style1, {
                    'default' : default_style,
                    'select' : select_style
                });
                myStyleMap = new OpenLayers.StyleMap(style);
            } else {
                var style = OpenLayers.Util.extend(temp_style1, {
                    'default' : default_style
                });
                myStyleMap = new OpenLayers.StyleMap(style);
            }
        }

        var layers = [];
        var isPgis = true;
        mapkind = mapUrl.split('|').reverse();
        for( var i = 0; i < mapkind.length; i++) {
            if (mapkind[i] == 'satelite') {
                isPgis = false;
                var saliteLayer =
                    new OpenLayers.Layer.GMapLayer("Google卫星图层",
                        [ "http://mt1.google.cn/vt/lyrs=s@123" ]);
                layers.push(saliteLayer);

            } else if (mapkind[i] == 'street') {
                isPgis = false;
                var streetLayer =
                    new OpenLayers.Layer.GMapLayer("Google路况图层",
                        [ "http://mt0.google.com/vt?lyrs=m@205000000,"
                            + "traffic|seconds_into_week:-1" ]);
                layers.push(streetLayer);

            } else {
                if (isPgis) {
                    var pgisUrl = mapkind[i].split('@');
                    var pgisLayer =
                        new OpenLayers.Layer.PGisLayer("PGIS Layer",
                            [ pgisUrl[1] ], {
                                zoomOffset : 4
                            });
                    layers.push(pgisLayer);
                }

            }
        }

        var map = new OpenLayers.Map(ele.get(0), {
            layers : layers,
            theme : null
        });

        // 地图数据url地址
        var url_address = '';
        if (isPgis) {
            url_address =
                'MapProxyServ?url='
                    + (layerUrl + 'query').replace('http://', '')
                    + "?outSR=4326&where=JKLX='ZAJK'";

        } else {
            url_address =
                'MapProxyServ?url='
                    + (layerUrl + 'query').replace('http://', '')
                    + "?where=JKLX='ZAJK'";
        }

        map.zoomToExtent(extent); // 地图范围

        var vector_layer = new OpenLayers.Layer.Vector('矢量点位', {
            styleMap : styleMap || myStyleMap,
//            url : url_address,
            eventListeners : {
                'loaded' : function() {
                    ele.trigger('loaded');
                }
            },
            rendererOptions : {
                zIndexing : true
            }
        // 控制图层叠加顺序
        }); // 底图图层

        map.addLayers([ vector_layer ]); // 增加图层

        map.addControl(new OpenLayers.Control.LayerSwitcher());

        var sfc = new OpenLayers.Control.ExSelectFeature(vector_layer, {
//        	types:[5,0,1,4],
        	multiple : false,
            toggle : true,
//            persist : persist,
            clickout : false, // 默认为true
//            sides : sides,
            radius : radius,
            fixedRadius : fixedRadius,
            continuous : false,
            geometryTypes: 'OpenLayers.Geometry.Point',
//            hover: true,
            onSelect : function(feature) {
                ele.trigger('onSelect', [ feature ]);
            },
            onUnselect : function(feature) {
                ele.trigger('onUnselect', [ feature ]);
            },
            onPathDone : function(geometry) {
                ele.trigger('onPathDone', [ geometry ]);
            },
            onPolygonDone : function(geometry) {
                ele.trigger('onPolygonDone', [ geometry ]);
            },
            onRegularPolygonDone : function(geometry) {
                ele.trigger('onRegularPolygonDone', [ geometry ]);
            }
        });
        
        var self = this;
        sfc.callbacks.click = function(feature){
            this.clickFeature.apply(this,Array.prototype.slice.call(arguments));
            self.showTip(feature);
        };
        sfc.callbacks.out = function(feature){
            this.outFeature.apply(this,Array.prototype.slice.call(arguments));
            self.closeTip(feature);
        };
        
//        map.addControl(sfc);
//        sfc.ul.show();
        panel.addControls([sfc]);
        
        /**
         * Method: activatePoint Activates the control.
         */
        this.activatePoint = function() {
            sfc.activate(-1);
            return this;
        };
        
        /**
         * Method: activateBox Activates the control.
         */
        this.activateBox = function() {
            sfc.activate(0);
            return this;
        };

        /**
         * Method: activatePath Activates the control.
         */
        this.activatePath = function() {
            sfc.activate(3);
            return this;
        };

        /**
         * Method: activatePath Activates the control.
         */
        this.activatePolygon = function() {
            sfc.activate(1);
            return this;
        };

        /**
         * Method: activateLinearRing Activates the control.
         */
        this.activateLinearRing = function() {
        	sfc.activate(4);
            return this;
        };

        /**
         * Method: activateRegularPolygon Activates the control.
         */
        this.activateRegularPolygon = function() {
            sfc.activate(2);
            return this;
        };

        /**
         * Method: center 传入的点要素居中 Parameters: feature:OpenLayers.Feature.Vector
         */
        this.center = function(feature) {
            var x = feature.geometry.x;
            var y = feature.geometry.y;
            map.setCenter([ x, y ]);
        };

        /**
         * Method: highlight 传入的点要素高亮 Parameters:
         * feature:OpenLayers.Feature.Vector
         */
        this.highlight = function(feature) {
            sfc.highlight(feature);
        };

        /**
         * Method: unhighlight 传入的点要素退出高亮 Parameters:
         * feature:OpenLayers.Feature.Vector
         */
        this.unhighlight = function(feature) {
            sfc.unhighlight(feature);
        };

        var popup = null;
        /**
         * Method: showTip 传入的点要素显示提示框 Parameters:
         * feature:OpenLayers.Feature.Vector
         */
        this.showTip =
            function(feature) {
                if (popup) {
                    popup.destroy();
                }
                var html = feature.attributes['DWMC'];
                popup =
                    new OpenLayers.Popup("selectfeature",
                        new OpenLayers.LonLat(feature.geometry.x,
                            feature.geometry.y), new OpenLayers.Size(180, 30),
                            html, true, function() {
                            popup.hide();
                            popup.destroy();
                            popup = null;
                            ele.trigger('onPopupClose', [ feature ]);
                        });
                popup.backgroundColor = "#a6bfdd";
                popup.opacity = "0.8";
                popup.border = "1px";

                map.addPopup(popup);
            };

        /**
         * Method: closeTip 关闭tip（使用非 popup的closeBox） Parameters:
         * feature:OpenLayers.Feature.Vector
         */
        this.closeTip = function(feature) {
            if (popup) {
                popup.hide();
            }
            return this;
        };

        /**
         * Method: getSelectedFeatures 获取通过线缓冲或区域选择而获得的点位要素
         * 
         * @return
         */
        this.getSelectedFeatures = function() {
            return vector_layer.selectedFeatures;
        };

        /**
         * Method: removeTips 删除现有的所有tips
         */
        this.removeAllTips = function() {
            for( var i = 0; i < map.popups.length; i++) {
                map.popups[i].hide();
            }
            for( var i = 0; i < map.popups.length; i++) {
                map.popups[i].destroy();
            }
            for( var i = 0; i < vector_layer.features.length; i++) {
                if (vector_layer.features[i].popup) {
                    vector_layer.features[i].popup = null;
                }

            }

        };

        /**
         * Method: getBufferDistance 获取线缓冲的距离
         * 
         * @return
         */
        this.buffer = function(buffer) {
            if (buffer) {
                sfc.buffer = parseFloat(buffer);
            } else {
                return sfc.buffer;
            };
        };

        /**
         * Method: getNeighborPoints 求取已知点周围最近的n个点 Parameters: dwbh:给定点要素的点位编号
         * n：最近的点的数量
         * 
         * @return
         */
        this.getNeighborPoints =
            function(dwbh, n) {
                var long = vector_layer.features.length;
                // 根据点位编号求出对应的点要素
                var centerFeature;
                for( var i = 0; i < long; i++) {
                    if (vector_layer.features[i].attributes.DWBH == dwbh) {
                        centerFeature = vector_layer.features[i];
                        return;
                    }
                }
                if (!centerFeature) {
                    return []; // 中心点位编号不准确,则返回空数组
                }

                // 为要素添加distance属性
                for( var i = 0; i < long; i++) {
                    var distance =
                        centerFeature.geometry
                            .distanceTo(vector_layer.features[i].geometry);
                    vector_layer.features[i].distance = distance;
                }

                // 根据distance对所有要素进行排序(从小到大)
                var sortFeatures = vector_layer.features;
                for( var i = 0; i < long; i++) {
                    for( var j = 0; j < long - i - 1; j++) {
                        if (sortFeatures[j].distance > sortFeatures[j + 1].distance) {
                            var temp = sortFeatures[j];
                            sortFeatures[j] = sortFeatures[j + 1];
                            sortFeatures[j + 1] = temp;
                        }
                    }
                }
                // 将带有distance属性的最近的N+1个点返回
                var neighborPoints = sortFeatures.slice(0, parseInt(n) + 1);
                return neighborPoints;
            };

        /**
         * Method: addFeatures 向vector_layer添加要素 Parameters： features：<OpenLayers.Feature.Vector>数组
         */
        this.addFeatures = function(features) {
            vector_layer.addFeatures(features);
        };

        /**
         * Method: removeFeatures 向vector_layer删除要素 Parameters： features：<OpenLayers.Feature.Vector>数组
         */
        this.removeFeatures = function(features) {
            // vector_layer.destroyFeatures(features);
            vector_layer.removeFeatures(features);
        };

        /**
         * Method: getSelector 返回控制绘制区域或缓冲线的控件
         * 
         * @return
         */
        this.getSelector = function() {
            return sfc;
        };

        // 增加绘制点要素的控件
        var drawFeatureCtl =
            new OpenLayers.Control.DrawFeature(vector_layer,
                OpenLayers.Handler.Point, {
                    featureAdded : function(feature) {
                        ele.trigger('featureAdded', [ feature ]);
                    }
                });
        map.addControl(drawFeatureCtl);

        this.activateDrawPoint = function() {
            sfc.deactivate();
            drawFeatureCtl.activate();
        };

        /**
         * Method: addFeaturesToLayer
         */
        this.addFeaturesToLayer = function() {
            vector_layer.exAddFeatures();
        };

        /**
         * Method: getFeatureByDWBH
         * 
         * @return
         */
        this.getFeatureByDWBH = function(dwbh) {
            var features = vector_layer.vectors;
            var long = features.length;
            // 根据点位编号求出对应的点要素
            for( var i = 0; i < long; i++) {
                if (features[i].attributes.DWBH === dwbh) {
                    return features[i];
                }
            }
        };

        this.addLayers = function(layers) {
            map.addLayers(layers); // 增加图层
        };

        this.getLayers = function() {
            return vector_layer;// 有待改进
        };
        
        this.getMap = function(){
        	return map;
        };

        return this;
    };