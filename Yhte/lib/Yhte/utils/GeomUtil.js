
GeomUtil = {
	/**
	 * 判断点是否在区域内
	 * @param [] checkPoint 待判断的点  [13369955.47, 3689103.90]
	 * @param [[],[],[],[]] fencePnts 局域 [[13370451.575174231, 3694831.495573645], [13376946.811652763, 3688642.007208254], [13367204.912397819, 3685011.2483647093], [13370451.575174231, 3694831.495573645]]
	 * @return {Boolean} true--在区域内  false--不在区域内
	 */
    pointInPolgon : function(checkPoint, fencePnts){
         var wn = 0, j = 0; // wn 计数器 j第二个点指针
             for (var i = 0; i < fencePnts.length; i++)
                    {// 开始循环
                        if (i == fencePnts.length - 1)
                            j = 0;// 如果 循环到最后一点 第二个指针指向第一点
                        else
                            j = j + 1; // 如果不是 ，则找下一点
                        if (fencePnts[i][1] <= checkPoint[1])
                        { // 如果多边形的点 小于等于 选定点的 y 坐标
                            if (fencePnts[j][1] > checkPoint[1])
                            { // 如果多边形的下一点 大于于 选定点的 y 坐标
                                if (isLeft(fencePnts[i], fencePnts[j], checkPoint) > 0)
                                {
                                    wn++;
                                }
                            }
                        }
                        else
                        {
                            if (fencePnts[j][1] <= checkPoint[1])
                            {
                                if (isLeft(fencePnts[i], fencePnts[j], checkPoint) < 0)
                                {
                                    wn--;
                                }
                            }
                        }
                    }
               
                if (wn == 0)
                    return false;
                else
                    return true;
    },
    
    /**
     * 判断点是否在线段左边
     * @param [] checkPoint 待判断的点  [120.31, 32.45]
     * @param [] startPoint 线段的起点  [120.56, 32.78]
     * @param [] endPoint 线段的终点  [120.07, 32.21]
     * @return 
     */
    isLeft : function(checkPoint, startPoint, endPoint){
        var abc = 0;
        abc = ((endPoint[0] - startPoint[0]) * (checkPoint[1] - startPoint[1]) - (checkPoint[0] - startPoint[0]) * (endPoint[1] - startPoint[1]));
        return abc;
    }

}