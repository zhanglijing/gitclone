//new一个文件对象f
if (!window.localStorage) {
    alert('您的浏览器不支持本地存储');
} else {
    var afiledata = JSON.parse(localStorage.getItem('localfiledata')) || fileData;
}
var f = new File(afiledata);
window.onload = function() {
    var oCss = document.getElementById('css'); 
    var oSideBarList = document.getElementById('sideBarList'); 
    var oSideBar = document.getElementById('sideBar');
    var oWeiyun = document.getElementById('weiyun');
    var oWI = oWeiyun.getElementsByTagName('i')[0];
    var oFiles = document.getElementById('files');
    var oMainpath = document.getElementById('mainpath');
    var oCheckall = getByClassName(document, 'label', 'checkall')[0]; //全选按钮
    var aDel = getByClassName(document, 'i', 'ico-del'); //所有删除按钮
    var oRightDel = document.getElementById('rightDel');
    var aRename = getByClassName(document, 'i', 'ico-rename'); //所有重命名按钮
    var oRightRename = document.getElementById('rightRename');
    var aMkdir = getByClassName(document, 'i', 'ico-mkdir'); //新建文件夹按钮
    var oRightClickMenu = document.getElementById('RightClickMenu');//右键菜单
    var that = oWeiyun;
    oSideBar.setAttribute('pnum', 0);
    oWeiyun.setAttribute('num', 0);
    addClass(oWeiyun,'has-children');
    oFiles.setAttribute('pnum', 0);
    //拖拽移动功能
    doMove();
    function doMove(){
        var aList = getByClassName(oFiles, 'div', 'list');
        for(var i=0; i<aList.length; i++){
            if(hasClass(aList[i].parentNode, 'ui-selected')){
                aList[i].onmousedown = function(ev){
                    var ev = ev || event;
                    ev.cancelBubble = true;
                    var ofilesmall = getByClassName(document, 'div', 'filesmall')[0];
                    var oI = ofilesmall.getElementsByTagName('i')[0];
                    var oSpan = ofilesmall.getElementsByTagName('span')[0];
                    var oDiv = getByClassName(document, 'div', 'div1')[0];
                    var aListwrapSelected = toArr(getListwrapNoselected(aList).listwrapSelected);
                    var iLen = aListwrapSelected.length;
                    oSpan.innerHTML = iLen;

                    addClass(ofilesmall, 'class'+(iLen>4?4:iLen));
                    //if(aListwrapSelected.length==0)return false;
                    var aListwrapNoselected = toArr(getListwrapNoselected(aList).listwrapNoselected);
                    var disX = ev.clientX;
                    var disY = ev.clientY;
                    document.onmousemove = function(ev){
                        var ev = ev || event;
                        var l = ev.clientX;
                        var t = ev.clientY;
                        if(Math.abs(disX-ev.clientX)>4 || Math.abs(disY-ev.clientY)>4){
                            ofilesmall.style.left = l + 'px';
                            ofilesmall.style.top = t + 'px';
                            ofilesmall.style.display = 'block';
                            hit(oI, aListwrapNoselected, true);
                        }
                                
                    };
                    document.onmouseup = function(){
                        var oResult = hit(oI, aListwrapNoselected, true)[0];                     
                        if(oResult){
                            removeClass(oResult.parentNode, 'ui-dropping');
                            var newpnum = oResult.getAttribute('num');
                            if(f.getInfo(newpnum).type == 'folder'){
                                for(var i=0; i<aListwrapSelected.length; i++){
                                    var num = aListwrapSelected[i].getAttribute('num');
                                    f.reMove(num, newpnum);
                                    //移动侧边SideBar下的Dom元素
                                    doMoveSideBar(newpnum);
                                    //更新oFiles区域Dom元素
                                    // oFiles.removeChild(aListwrapSelected[i].parentNode);
                                    doMoveFiles(newpnum);
                                }
                                //更新一下缓存数据
                                updateLocalData(); 
                            }
                        }
                        removeClass(ofilesmall, 'class'+(iLen>4?4:iLen));
                        ofilesmall.style.display = 'none';
                        document.onmousemove = document.onmouseup = null;
                    }
                    return false;
                };
            }
        }
    }
    //得到有className中有list-wrap，但是没有ui-selected的集合和两个都有的集合
    function getListwrapNoselected(arr){
        var arrSelected = [];
        var arrNoselected = [];
        for(var i=0; i<arr.length; i++){
            if(hasClass(arr[i].parentNode, 'ui-selected')){
                arrSelected.push(arr[i]);
            }else{
                arrNoselected.push(arr[i]);
            }
        }
        return {
            listwrapSelected : arrSelected,
            listwrapNoselected : arrNoselected
        };
    }
    //把元素数组转化成普通数组
    function toArr( v ){
        var arr = [];   
        for(var i=0; i<v.length; i++){
            arr.push( v[i] );   
        }   
        return arr; 
    }
    //移动侧边SideBar下的Dom元素封装函数
    function doMoveSideBar(newpnum){
        var pid = f.getInfo(newpnum).pid;
        var oItemPum = findParentSideBar(pid);
        oItemPum.innerHTML = '';
        var c = f.getFolderChildren(pid);
        createViewSideBar(oItemPum, c);
    }
    //Files区域Dom元素封装函数
    function doMoveFiles(newpnum){
        var pid = f.getInfo(newpnum).pid;
        var e = f.getFolderChildren(pid);
        createViewFiles(e);
    }
    //end拖拽移动功能add
    //阻止document的右键默认事件
    document.oncontextmenu = function( ev ){    
        //return false;
    };
    //关掉右键菜单功能
    offORightClickMenu();
    function offORightClickMenu(){
        document.onclick = function(){
            oRightClickMenu.style.display = 'none';  
        };
    }
    //为新建文件夹按钮添加功能
    aMkdir[0].parentNode.onclick = function(ev){ 
        var ev = ev || event;
        ev.cancelBubble = true;
        var oEmpty = getByClassName(oFiles, 'div', 'g-empty')[0];
        if(oEmpty)oFiles.removeChild(oEmpty);
        //此处需要得到新建文件的id号
        var newid = f.newId();
        var newpid = Number(oFiles.getAttribute('pnum'));
        var file = createFile({
            id : newid,
            pid : newpid,
            type : 'folder'
        });
        //插入放在最前面，但是一刷新会跑到最后边
        //oFiles.insertBefore(file.oListWrap, oFiles.children[0]);
        oFiles.appendChild(file.oListWrap);
        file.oEm.style.display = 'none';
        file.oFileedit.style.display = 'block';
        file.oFileinput.focus();
        file.oFileinput.onclick = file.oFileinput.onmousemove = file.oFileinput.onmousedown = function(ev){
            var ev = ev || event;
            ev.cancelBubble = true;
        };
        file.oListClear.setAttribute('num', newid);
        //处理不识别的图标类型
        file.oFolder.className = 'filetype icon-folder';
        //file.oFileinput.onblur = function(){
        document.onclick = function(){
            var newValue = file.oFileinput.value || '未命名';
            //此处需要得到新建文件的文件名字
            file.oEm.title = newValue;
            file.oEm.innerHTML = newValue;
            file.oEm.style.display = 'block';
            file.oFileedit.style.display = 'none';
            f.addData(newid, newpid, newValue);
            //更新SideBar中对应的相关文件的文件名
            showTriangle({
                id : newid,
                pid : newpid,
                name : newValue,
                type : 'folder'
            });
            //更新一下缓存数据
            updateLocalData();
            //alert('新建文件夹成功');
            //document.onclick = null;
            offORightClickMenu();
        }    
    }
    //新建文件时更新SideBar显示功能函数
    function showTriangle(df){
        var oItem = findSelfSideBar(df.pid);
        var context = null;
        if(hasClass(oItem,'has-children')){
            context = findParentSideBar(df.pid);
        }else{
            addClass(oItem,'has-children');
            addClass(oItem,'item-open');
            oItem.onOff = true;
            oItem.status = 'down';
            var oA = oItem.getElementsByTagName('a')[0];
            var oI = document.createElement('i');
            oA.appendChild(oI);
            var oItemBox = document.createElement('div');
            oItemBox.className = 'item-box';
            oItemBox.setAttribute('pnum', df.pid);
            var parentsId = f.getInfo(df.pid).pid;
            var oParents = findParentSideBar(parentsId);
            var next = getNext(oItem);
            oParents.insertBefore(oItemBox, next);
            context = oItemBox;
            oI.onclick = function(ev){
                var ev = ev || event;
                //阻止冒泡
                ev.cancelBubble = true;
                var parent = this.parentNode.parentNode;
                var oPnum = findPnum(df.pid);
                if(!oPnum)return;
                //调用三角收缩或展开功能封装函数
                contractionIn(parent,oPnum); 
            };     
        }
        //处理侧边栏
        var oDiv = document.createElement('div');
        var oA = document.createElement('a');
        var oSpan = document.createElement('span');
        oDiv.setAttribute('num', df.id);
        oSpan.title = df.name;
        oSpan.innerHTML = df.name;
        oA.appendChild(oSpan);
        oDiv.className = 'item';      
        oDiv.appendChild(oA);
        context.appendChild(oDiv);

        //为oSideBar下的oDiv添加事件
        oDiv.onclick = function(ev){
            var ev = ev || event;
            //阻止冒泡
            ev.cancelBubble = true;
            removeClass(that,'list-selected');
            that = this;
            addClass(this,'list-selected');
            var oPnum = findPnum(df.id);
            //调用三角展开功能封装函数
            expand(this,oPnum);
            //通过单击oSideBar下的oDiv改变内容区域
            var e = f.getChildren(df.id);
            //调用更新Files数据函数
            updateFiles(e, df.id);
            //通过单击oSideBar下的oDiv来改变主路径地址区域区域数据
            var g = f.getSelfAndParents(df.id);
            //调用更新Mainpath数据函数
            updateMainpath(g, df.id);
            SelecttableHelper();
        }      
    }
    //为重命名按钮添加功能
    oRightRename.onclick = aRename[0].parentNode.onclick = function(ev){
        oRightClickMenu.style.display = 'none';
        var ev = ev || event;
        ev.cancelBubble = true;
        var aUiselected =  getByClassName(oFiles, 'div', 'ui-selected');
        if(aUiselected.length==0){
            alert('请选择要重命名的文件');
            return;
        }
        if(aUiselected.length!=1){
            alert('只能对单个文件（夹）重命名');
            return;
        }
        var num = aUiselected[0].children[0].getAttribute('num');
        var oName =  getByClassName(aUiselected[0], 'span', 'name')[0];
        var oFileedit = getByClassName(oName, 'em', 'fileedit')[0];
        var oFileinput = oFileedit.children[0];
        //alert(num);
        var oldValue = oName.children[0].innerHTML;
        oName.children[0].style.display = 'none';
        oFileedit.style.display = 'block';
        oFileinput.value = oldValue;
        oFileinput.focus();
        oFileinput.select();
        oFileinput.onclick = oFileinput.onmousemove = oFileinput.onmousedown = function(ev){
            var ev = ev || event;
            ev.cancelBubble = true;
        }
        // oFileinput.onblur = function(){
        document.onclick = function(){
            var newValue = oFileinput.value;
            oName.children[0].innerHTML = newValue;
            oName.children[0].style.display = 'block';
            oFileedit.style.display = 'none';
            f.reName(num, newValue);
            removeClass(aUiselected[0],'ui-selected');
            //更新SideBar中对应的相关文件的文件名
            reName(num, newValue);
            //更新一下缓存数据
            updateLocalData();
            //alert('更名成功');
            offORightClickMenu();
        }
    }
    //参数为id号，作用：更新SideBar中对应的相关文件的文件名。
    function reName(num, newName){
        var oItem = findSelfSideBar(num);
        var oSpan = oItem.getElementsByTagName('span')[0];
        oSpan.innerHTML = newName;
    }

    //为删除按钮添加功能
    oRightDel.onclick = aDel[0].parentNode.onclick = function(){
        var aUiselected =  getByClassName(oFiles, 'div', 'ui-selected');
        var pid;
        if(aUiselected.length==0){
            alert('请选择要删除的文件');
            return;
        }
        for(var i=0; i<aUiselected.length; i++){
            //删除oFiles的Dom元素
            //oFiles.removeChild(aUiselected[i]);
            var num = aUiselected[i].children[0].getAttribute('num');
            pid = f.getInfo(num).pid;
            var type = f.getInfo(num).type;
            //删除侧边Dom元素 
            if(type=='folder')deleteDomSideBar(findParentSideBar(pid),num);
            f.deleteData(num);
        }
        //更新一下缓存数据
        updateLocalData();
        //判断是否删除三角
        if(type=='folder')hasChildren(pid);
        //更新oFiles显示状态
        var e = f.getChildren(pid); 
        updateFiles(e)
        
    }
    //判断是否删除三角
    function hasChildren(num){
        if(num==0)return;
        if(!f.isFolderParent(num)){
            var obj = findSelfSideBar(num).children[0];
            //alert(findSelfSideBar(num).children[0]);
            obj.removeChild(obj.children[1]);
        }
    }
    //参数为num,根据num找到对应的num返回obj
    function findSelfSideBar(num){
        var aItem = getByClassName(oSideBarList, 'div', 'item');
        for(var i=0; i<aItem.length; i++){
            if(aItem[i].getAttribute('num')==num){
                return aItem[i];
            }
        }
    }
    //参数为num，根据num找到对应的pnum返回obj
    function findParentSideBar(pnum){
        var aItemBox = getByClassName(oSideBarList, 'div', 'item-box');
        for(var i=0; i<aItemBox.length; i++){
            if(aItemBox[i].getAttribute('pnum')==pnum){
                return aItemBox[i];
            }
        }
    }
    //参数为id号，作用：删除SideBar中对应的相关文件的Dom元素。
    function deleteDomSideBar(context, num){
        var aItem = getByClassName(context, 'div', 'item');
        var aItemBox = getByClassName(context, 'div', 'item-box');
        for(var i=0; i<aItem.length; i++){
            if(aItem[i].getAttribute('num')==num){
                context.removeChild(aItem[i]);
                break;
            }
        } 
        for(var i=0; i<aItemBox.length; i++){
            if(aItemBox[i].getAttribute('pnum')==num){
                context.removeChild(aItemBox[i]);
                break;
            }
        } 
    }
    //为全选按钮添加功能
    oCheckall.onclick = function(){
        var aListwrap =  getByClassName(oFiles, 'div', 'list-wrap');
        if(hasClass(this,'checkalled')){
            removeClass(this,'checkalled');
            for(var i=0; i<aListwrap.length; i++){
                removeClass(aListwrap[i],'ui-selected');
            }
        }else{
            addClass(this,'checkalled');
            for(var i=0; i<aListwrap.length; i++){
                addClass(aListwrap[i],'ui-selected');
            }
        }
    };
    //单独为oWeiyun增加效果
    oWeiyun.status = 'down';
    //单独为oWeiyun下三角增加效果
    oWI.onclick = function(ev){
        var ev = ev || event;
        //阻止冒泡
        ev.cancelBubble = true;
        var parent = this.parentNode.parentNode;
        //调用三角收缩或展开功能封装函数
        contractionIn(parent,oSideBar);
    }
    
    oWeiyun.onclick = function(ev){
        var ev = ev || event;
        //阻止冒泡
        ev.cancelBubble = true;
        removeClass(that,'list-selected');
        that = this;
        addClass(this,'list-selected');
        if(this.status == 'up'){
            this.status = 'down';
            addClass(this,'item-open');
            oSideBar.style.display='block';
        }   
        
        // 通过单击oWeiyun改变内容区域
        var e = f.getChildren(0);
        //调用更新Files数据函数
        updateFiles(e, 0); 
        // 通过单击oWeiyun改变主路径地址区域数据
        oMainpath.innerHTML = '<a href="#" class="path current" style="z-index:999;">微云</a>';
        //阻止双击选中文字的默认事件
        SelecttableHelper();
    }
    //df为得到当前文件夹的子文件,文件为文件夹类型
    var df = f.getFolderChildren(0);
    //d为得到当前文件夹的子文件,文件为所有类型
    var d = f.getChildren(0);
    //调用初始化函数
    createView(d, df);
    //设置css样式
    var str = '';
    for(var i=0; i<20; i++){
        str += '#sideBarList .item-box';
        for(var j=0; j<i; j++){
            str += ' .item-box';
        }
        str += ' .item{padding-left:' +(28+14*i)+ 'px;}'
    }
    oCss.innerHTML = str;
    
    //初始化数据
    function createView(d, df) {
        oMainpath.innerHTML = '<a href="#" class="path current" style="z-index:999;">微云</a>';
        createViewFiles(d);
        createViewSideBar(oSideBar, df);
    }

    //侧边数据
    function createViewSideBar(context, df){
        for (var i=0; i<df.length; i++) {
            createSideBar(context, df[i]);
        }
    }
    //文件区域数据
    function createViewFiles(d){
        oFiles.innerHTML = '';
        for (var i=0; i<d.length; i++) {
            createFiles(oFiles, d[i]);
        }
    }
    //处理主路径地址区域数据
    function createViewMainpath(g){
        oMainpath.innerHTML = '';
        //单独处理微云部分
        var oPath = document.createElement('a');
        oPath.className = 'path';
        oPath.style.zIndex = g.length+1;
        oPath.innerHTML = '微云';
        oMainpath.appendChild(oPath);
        oPath.onclick = function(){
            var aPath = getByClassName(oMainpath, 'a', 'path');
            addClass(this,'current');
            for(var i=0; i<aPath.length; i++){
                if(aPath[i]!=oPath)oMainpath.removeChild(aPath[i]);
            }
            //通过主路径地址微云来改变内容区域数据
            var e = f.getChildren(0);
            //调用更新Files数据函数
            updateFiles(e, 0);
            //通过主路径地址微云来改变oSideBar下的oDiv
            removeClass(that,'list-selected');
            that = oWeiyun;
            addClass(that,'list-selected');

        };
        //单独处理微云部分结束
        for (var i=0; i<g.length; i++) {
            createMainpath(oMainpath, g[i], g.length-i);
        }
    }
    //创建主路径地址区域数据
    function createMainpath(context, g, i){
        //处理创建主路径地址区域数据
        var oPath = document.createElement('a');
        oPath.className = 'path';
        oPath.style.zIndex = i;
        oPath.innerHTML = g.name;
        oPath.setAttribute('num', g.id);
        context.appendChild(oPath);
        // <a href="#" class="path current" style="z-index:2;">张利晶1102</a>
        //给oPath添加事件
        oPath.onclick = function(){
            //通过主路径地址区域来改变主路径地址区域区域数据
            var p = f.getSelfAndParents(g.id);
            //调用更新Mainpath数据函数
            updateMainpath(p, g.id);
            //通过主路径地址区域来改变内容区域数据
            var e = f.getChildren(g.id);
            //调用更新Files数据函数
            updateFiles(e, g.id);
            //通过主路径地址区域来改变oSideBar下的oDiv
            var num = this.getAttribute('num');
            removeClass(that,'list-selected');
            that = findItem(num);
            addClass(that,'list-selected');
            //调用从当前到当前的所有祖先（oSideBar下的aItem）显示封装函数
            displayParents(g.id);
        };
    }

    //创建侧边栏区域数据
    function createSideBar(context, df) {
        //处理侧边栏
        var oDiv = document.createElement('div');
        var oA = document.createElement('a');
        var oSpan = document.createElement('span');
        oDiv.setAttribute('num', df.id);
        oSpan.title = df.name;
        oSpan.innerHTML = df.name;
        oA.appendChild(oSpan);
        oDiv.className = 'item';
        //有子级
        if ( f.isFolderParent(df.id)) {
            var oI = document.createElement('i');
            addClass(oDiv,'has-children');
            oDiv.onOff = false;
            oDiv.status = 'up';
            oI.onclick = function(ev){
                var ev = ev || event;
                //阻止冒泡
                ev.cancelBubble = true;
                var parent = this.parentNode.parentNode;
                if(!parent.onOff){
                    //调用生成孩子封装函数
                    addChildren(context, parent, df.id);   
                }
                var oPnum = findPnum(df.id);
                if(!oPnum)return;
                //调用三角收缩或展开功能封装函数
                contractionIn(parent,oPnum); 
            };     
            oA.appendChild(oI); 
        }       
        oDiv.appendChild(oA);
        context.appendChild(oDiv);

        //为oSideBar下的oDiv添加事件
        oDiv.onclick = function(ev){
            var ev = ev || event;
            //阻止冒泡
            ev.cancelBubble = true;
            removeClass(that,'list-selected');
            that = this;
            addClass(this,'list-selected');
            //有孩子并且孩子不存在页面中
            if(hasClass(this,'has-children') && !this.onOff){
                //调用生成孩子封装函数
                addChildren(context, this, df.id);
            }
            var oPnum = findPnum(df.id);
            //调用三角展开功能封装函数
            expand(this,oPnum);
            
            //通过单击oSideBar下的oDiv改变内容区域
            var e = f.getChildren(df.id);
            //调用更新Files数据函数
            updateFiles(e, df.id);
            //通过单击oSideBar下的oDiv来改变主路径地址区域区域数据
            var g = f.getSelfAndParents(df.id);
            //调用更新Mainpath数据函数
            updateMainpath(g, df.id);
            SelecttableHelper();
            // document.onmousedown = function(ev){
            //     var e = ev || event;
            //     var target = e.tareget || e.srcElement;

            //     while(target) {
            //         if (hasClass(target, 'item')) {
            //             return false;
            //         }
            //         target = target.parentNode;
            //     }
            // }
        }
    }
    //生成文件区的一个文件函数
    function createFile(d){
        var oListWrap = document.createElement('div');
        var oListClear = document.createElement('div');
        var oCheckbox = document.createElement('label');
        var oImg = document.createElement('span');
        var oFolder = document.createElement('i');
        var oName = document.createElement('span');
        var oEm = document.createElement('em');
        var oFileedit = document.createElement('em');
        oFileedit.className = 'fileedit';
        var oFileinput = document.createElement('input');
        oFileinput.className = 'fileinput';
        oFileedit.appendChild(oFileinput);
        var oTool = document.createElement('sapn');
        var oADel = document.createElement('a');
        var oIDel = document.createElement('i');
        var oARename = document.createElement('a');
        var oIRename = document.createElement('i');
        var oAMove = document.createElement('a');
        var oIMove = document.createElement('i');
        var oAShare = document.createElement('a');
        var oIShare = document.createElement('i');
        var oADownload = document.createElement('a');
        var oIDownload = document.createElement('i');
        var oSize = document.createElement('span');
        var oTime = document.createElement('span');
        oListWrap.className = 'list-wrap';
        oListClear.className = 'list clear';
        oCheckbox.className = 'checkbox';
        oImg.className = 'img';
        oName.className = 'name';
        oTool.className = 'tool';
        oADel.title = "删除";
        oIDel.className = 'ico-del';
        oARename.title = "重命名";
        oIRename.className = 'ico-rename';
        oAMove.title = "移动";
        oIMove.className = 'ico-move';
        oAShare.title = "分享";
        oIShare.className = 'ico-share';
        oADownload.title = "下载";
        oIDownload.className = 'ico-download';
        oSize.className = 'size';
        oTime.className = 'time';
        //后期需要写个函数来获取系统时间
        oTime.innerHTML = '2014-12-19 10:20';
      
        oListClear.appendChild(oCheckbox);
        oImg.appendChild(oFolder);
        oListClear.appendChild(oImg);
        oName.appendChild(oEm);
        oName.appendChild(oFileedit);
        oListClear.appendChild(oName);
        oADel.appendChild(oIDel);
        oTool.appendChild(oADel);
        oARename.appendChild(oIRename);
        oTool.appendChild(oARename);
        oAMove.appendChild(oIMove);
        oTool.appendChild(oAMove);
        oAShare.appendChild(oIShare);
        oTool.appendChild(oAShare);
        oADownload.appendChild(oIDownload);
        oTool.appendChild(oADownload);        
        oListClear.appendChild(oTool);
        oListClear.appendChild(oSize);
        oListClear.appendChild(oTime);
        oListWrap.appendChild(oListClear);

        //为oListClear添加事件
        oListClear.onclick = function(){
            if(d.type == 'folder'){
                //通过单击oListClear来改变oDiv改变内容区域
                var e = f.getChildren(d.id); 
                //调用更新Files数据函数
                updateFiles(e, d.id);
                
                //通过单击oListClear来改变oSideBar下的oDiv
                var num = this.getAttribute('num');
                removeClass(that,'list-selected');
                that = findItem(num);
                addClass(that,'list-selected');
                //有孩子并且孩子不存在页面中
                if(hasClass(that,'has-children') && !that.onOff){
                    //调用生成孩子封装函数
                    var oPid = f.getInfo(num).pid;
                    if(oPid==0){
                        addChildren(oSideBar, that, d.id);
                    }else{
                        var oItem = findParentSideBar(oPid);
                        addChildren(oItem, that, d.id);
                    }
                }
                var oPnum = findPnum(d.id);
                //调用三角展开功能封装函数
                expand(that,oPnum);


                //调用从当前到当前的所有祖先（oSideBar下的aItem）显示封装函数
                displayParents(d.id);


                //通过单击oListClear来改变主路径地址区域区域数据
                var g = f.getSelfAndParents(d.id);
                //调用更新Mainpath数据函数
                updateMainpath(g, d.id);
            }else{
                //此处为文件，可以直接打开阅读，没有必要再打开下级文件，也为没有下级文件
                // var fso, ts, s ;
                // var ForReading = 1;
                // fso = new ActiveXObject("Scripting.FileSystemObject");
                // ts = fso.OpenTextFile("d:\\testfile.txt", ForReading);
                // ts = fso.OpenTextFile('folder/' + d.name + '.' + d.type, ForReading);
                // s = ts.ReadLine();
                // alert(s);
                window.open('folder/' + d.name + '.' + d.type);
            }
        };
        //自定义右键菜单功能
        oListClear.oncontextmenu = function( ev ){
            var ev = ev || event;
            if(!hasClass(this.parentNode, 'ui-selected')){
                var aListwrap = getByClassName(oFiles, 'div', 'list-wrap');
                for(var i=0; i<aListwrap.length; i++){
                    removeClass(aListwrap[i], 'ui-selected');
                }
                addClass(this.parentNode, 'ui-selected');
            }
            
            //上下文菜单事件。
            oRightClickMenu.style.left = ev.clientX + 'px';
            oRightClickMenu.style.top = ev.clientY + 'px';
            oRightClickMenu.style.display = 'block';
        };
        oCheckbox.onclick = function(ev){
            var ev = ev || event;
            var parent = this.parentNode.parentNode;
            ev.cancelBubble = true;
            //若此文件当前是选中状态，单击在取消选中，否则相反
            hasClass(parent,'ui-selected')?removeClass(parent,'ui-selected'):addClass(parent,'ui-selected');
            ischeckalled()?addClass(oCheckall,'checkalled'):removeClass(oCheckall,'checkalled');
            doMove();
        };
        oCheckbox.onmousedown = function(){            
            return false;
        }
        return {
            oListWrap : oListWrap,
            oListClear : oListClear,
            oFolder : oFolder,
            oEm : oEm,
            oFileedit : oFileedit,
            oFileinput : oFileinput,
            oCheckbox : oCheckbox
        };
    }
    //创建文件区域数据
    function createFiles(content,d){
        //处理文件区域数据
        var file = createFile(d);
        file.oEm.style.display = 'block';
        file.oFileedit.style.display = 'none';
        file.oListClear.setAttribute('num', d.id);
        //处理不识别的图标类型
        var type = '';

        if (!d.type) {
            type = 'file';
        } else {
            type = d.type;
        }

        file.oFolder.className = 'filetype '+typeData[type];
        file.oEm.title = d.name;
        file.oEm.innerHTML = d.name;
        content.appendChild(file.oListWrap);    
    }
    //拖拽虚框功能
    SelecttableHelper();
    function SelecttableHelper(){
        document.onmousedown = function(ev){
            var ev = ev || event;
            var L1 = ev.clientX;
            var T1 = ev.clientY;
            var oUiSelecttableHelper = getByClassName(document, 'div', 'ui-selectable-helper')[0];
            var aList = getByClassName(oFiles, 'div', 'list');
            if( oUiSelecttableHelper.bDown )return false;
            oUiSelecttableHelper.bDown = true;
            document.onmousemove = function(ev){
                var ev = ev || event;
                var L2 = ev.clientX;
                var T2 = ev.clientY;
                L2 = L2 < 0 ? 0 : L2;
                L2 = L2 > document.documentElement.clientWidth ? document.documentElement.clientWidth : L2;
                T2 = T2 < 0 ? 0 : T2;
                T2 = T2 > document.documentElement.clientHeight ? document.documentElement.clientHeight : T2;

                var disX = Math.abs(L1 - L2);
                var disY = Math.abs(T1 - T2);
                
                if(disX > 10 || disY > 10){
                    oUiSelecttableHelper.style.display = 'block';
                    hit(oUiSelecttableHelper,aList);
                    oUiSelecttableHelper.style.left = L1 > L2 ? (L2 + 'px') : (L1 + 'px');
                    oUiSelecttableHelper.style.top = T1 > T2 ? (T2 + 'px') : (T1 + 'px');
                    oUiSelecttableHelper.style.width = Math.abs(disX - 2) + 'px';
                    oUiSelecttableHelper.style.height = Math.abs(disY - 2) + 'px';
                }               
            }
            document.onmouseup = function(ev){ 
                var ev = ev || event;
                if(Math.abs(L1-ev.clientX)!=0 || Math.abs(T1-ev.clientY)!=0 )hit(oUiSelecttableHelper,aList);                  
                oUiSelecttableHelper.bDown = false;   
                oUiSelecttableHelper.style.display = 'none';
                doMove();
                document.onmousemove = document.onmouseup = null;               
            }
            return false;  
        }
    }
    //判断是否进入虚框区域
    function hit(obj, aArr, drop) {
        // var L1 = obj.offsetLeft;
        // var T1 = obj.offsetTop;
        var L1 = getPos(obj).l;
        var T1 = getPos(obj).t;
        var R1 = L1 + obj.offsetWidth;
        var B1 = T1 + obj.offsetHeight;
        var result = [];
        for (var i=0; i<aArr.length; i++) {
            if (obj != aArr[i]) {;
                var L2 = getPos( aArr[i] ).l;
                var T2 = getPos( aArr[i] ).t;
                var R2 = L2 + aArr[i].offsetWidth;
                var B2 = T2 + aArr[i].offsetHeight;
                if (!(R1 < L2 || B1 < T2 || L1 > R2 || T1 > B2)) {
                    result.push(aArr[i]);
                    if(drop){
                        addClass(aArr[i].parentNode, 'ui-dropping');
                    }else{
                        addClass(aArr[i].parentNode, 'ui-selected');
                    }
                    continue;
                }
                if(drop){
                    removeClass(aArr[i].parentNode, 'ui-dropping');
                }else{
                    removeClass(aArr[i].parentNode, 'ui-selected');
                }       
            }
        }
        return result;
    }
    //得到一个定位物体到body的距离
    function getPos( obj ){
        var aPos = {l: 0, t: 0};
        while( obj ){               
            aPos.l += obj.offsetLeft;
            aPos.t += obj.offsetTop;                
            obj = obj.offsetParent;             
        }           
        return aPos;
    }   
    //end拖拽虚框效果
    //判断全选按钮是否选中函数
    function ischeckalled(){
        var aListwrap =  getByClassName(oFiles, 'div', 'list-wrap');
        if(aListwrap.length == 0)return false;
        for(var i=0; i<aListwrap.length; i++){
            if(!hasClass(aListwrap[i],'ui-selected'))return false;
        }
        return true;
    }
    //从当前到当前的所有祖先（oSideBar下的aItem）显示封装函数
    function displayParents(num){
        var aItem = getByClassName(oSideBar, 'div', 'item');
        var find = false;
        for(var i=0;i<aItem.length; i++){
            if(aItem[i].getAttribute('num') == num){
                var current = aItem[i].parentNode;
                var prev = getPrev(current);
                expand(prev,current);
                num = prev.getAttribute('num');
                find = true;
                break;
            } 
        }
        if(find)displayParents(num);
    }
    //第一个参数为当前文件的孩子文件集合，作用：更新Files数据
    function updateFiles(e, pnum){
        if(typeof pnum != 'undefined')oFiles.setAttribute('pnum', pnum);
        if(e.length == 0){
        oFiles.innerHTML = '<div class="g-empty"><div class="empty-box"><div class="ico"></div><p class="title">暂无文件</p><p class="content">请点击左上角的“上传”按钮添加</p></div></div>';  
        } else{
           createViewFiles(e);
        }
        ischeckalled()?addClass(oCheckall,'checkalled'):removeClass(oCheckall,'checkalled');    

    } 
    //第一个参数为当前文件的父级一直到最顶级的文件，类型都为folder的集合，第二个参数为当前选择的对象的id号，作用：更新Mainpath数据
    function updateMainpath(parents, id){
        createViewMainpath(parents)
        addClass(findPath(id),'current');
    }
    //第一个参数为要展开对象的父级，第二个参数为展开的对象。作用：为三角展开功能封装函数
    function expand(oCurrent,oChildren){
        if(oCurrent.status == 'up'){
            oCurrent.status = 'down';
            addClass(oCurrent,'item-open');
            if(oChildren)oChildren.style.display='block';
        }
    }
    //第一个参数为当前单击的文件对象，第二个参数为收缩展开的对象。作用：为三角收缩或展开功能封装函数
    function contractionIn(oCurrent,oChildren){
        if(oCurrent.status == 'up'){
            oCurrent.status = 'down';
            addClass(oCurrent,'item-open');
            oChildren.style.display='block';
        }else{
            oCurrent.status = 'up';
            removeClass(oCurrent,'item-open');
            oChildren.style.display='none';
        }
        SelecttableHelper();  
    }
    //第一个参数为当前单击对象的父级，第二个参数当前单击的对象，第三个参数为当前对象的id号：生成孩子封装函数
    function addChildren(context, oCurrent, id){
        oCurrent.onOff = true;
        var cId = oCurrent.getAttribute('num');
        var c = f.getFolderChildren(cId);
        var next = getNext(oCurrent);
        var oDivParent = document.createElement('div');
        oDivParent.setAttribute('pnum', id);
        oDivParent.className = 'item-box';
        context.insertBefore(oDivParent, next);
        createViewSideBar(oDivParent, c);
    }
    //得到当前元素的上一个元素
    function getPrev(obj){
        if( !obj || !obj.previousSibling)return null;
        return obj.previousSibling.nodeType === 1 ? obj.previousSibling : getPrev(obj.previousSibling);
    }
    //得到当前元素的下一个元素
    function getNext(obj){
        if(!obj || !obj.nextSibling)return null;
        return obj.nextSibling.nodeType === 1 ? obj.nextSibling : getNext(obj.nextSibling);
    }
    //第一个参数为对象，第二个参数为className; 作用：判断元素身上有没有指定的className,有 ： 返回 true   没有: 返回 false
    function hasClass(obj,classname){
        var re = new RegExp('(^|\\s)' + classname + '(\\s|$)');
        return re.test(obj.className);
    }
    //第一个参数为对象，第二个参数为className; 作用：删除class
    function removeClass(obj,classname){
        //判断一下对象本身是否存在class,若本身不存在也没有必要删除，直接退出函数
        if(!obj.className)return;
        //用正则删除classname
        var re = new RegExp('(^|\\s)' + classname + '(\\s|$)');
        obj.className = obj.className.replace(/(^\s+)|(\s+$)|(\s+)/g,function($0, $1, $2, $3){
                if ($1 || $2) {
                    return '';
                }
                return ' ';
        }).replace(re, function($0, $1, $2) {
            return $1 + $2;
        }).replace(/(^\s+)|(\s+$)|(\s+)/g, function($0, $1, $2, $3) {
            if ($1 || $2) {
                return '';
            }
            return ' ';
        });
    }

    //第一个参数为对象，第二个参数为className; 作用：添加class
    function addClass(obj,classname){
        //判断一下对象本身是否存在class,若不存在直接添加，添加后直接退出函数
        if(!obj.className){
            obj.className = classname;
            return;
        }
        //用正则判断一下，看看原有的class里面是否包含classname，若包含，则不添加classname,直接退出函数
        var re = new RegExp('(^|\\s)' + classname + '(\\s|$)');
        if(re.test(obj.className))return;
        //以上情况都判断完后，说明原来的class里存在其它class但不包含classname,则把classname追加到最后面，并在追加前先追加一个空格字符串
        obj.className += ' ' + classname; 
    }

    //通过class获取元素
    function getByClassName(context, tagname, classname) {
        var aElements = context.getElementsByTagName(tagname);
        var result = [];
        var re = new RegExp('(^|\\s)' + classname + '(\\s|$)');

        for (var i=0; i<aElements.length; i++) {
            if ( re.test(aElements[i].className) ) {
                result.push(aElements[i]);
            }
        }
        return result;
    }
    //能过num找到对应的pnum
    function findPnum(num){
        var arr = getByClassName(oSideBar, 'div', 'item-box');
        for(var i=0; i<arr.length; i++){
            if(arr[i].getAttribute('pnum') == num)return arr[i];
        }
        return false;
    }
    //通过div身上的自定义属性num找到对应的Path,找到返回对应的Path，否则返回false;
    function findPath(num){
        var aPath = getByClassName(oMainpath, 'a', 'path');
        for(var i=0; i<aPath.length; i++){
            if(aPath[i].getAttribute('num') == num)return aPath[i];
        }
        return false;
    }
    //通过参数num找到对应的item
    function findItem(num){
        var aItem = getByClassName(oSideBar, 'div', 'item');
        for(var i=0; i<aItem.length; i++){
            if(aItem[i].getAttribute('num') == num)return aItem[i];
        }
        return false;
    }
    //更新本地存储数据
    //updateLocalData();
    function updateLocalData(){
        console.log(f.getData());
        console.log(JSON.parse(localStorage.getItem('localfiledata')));
        localStorage.setItem('localfiledata', JSON.stringify(f.getData()));
    }




/*点击展开收缩目录树，点击缩略图、列表形式转换*/
    var oDbviewBtn = getByClassName(document,'a','dbview')[0];
    var oSortviewBtn = getByClassName(document,'a','sortview')[0];
    var vmBox = getByClassName(document,'ul','vm_box')[0];

    var oList = getByClassName(document,'div','files-list')[0];

    oDbviewBtn.onclick=function(){
        var oBody_dbview = getByClassName(document,'body','dbview-module')[0];
        if(!oBody_dbview){
            addClass(document.body,'dbview-module');
            this.title = '隐藏目录树';
        }else{
            removeClass(document.body,'dbview-module');
            this.title = '查看目录树';
        }  
    }
    oSortviewBtn.onmouseover = vmBox.onmouseover = function(){
        clearTimeout(oSortviewBtn.timer);
        vmBox.style.display="block";
    }
    oSortviewBtn.onmouseout = vmBox.onmouseout = function(){
        //vmBox.style.display="none";
        oSortviewBtn.timer=setTimeout(function(){
            vmBox.style.display='none';
        },200);
    }
    oSortviewBtn.onclick=function(){
        if(!oSortviewBtn.onOff) {
            oList.className='files-list';
            oSortviewBtn.onOff=true;
        }else{
            oList.className='files-list files-view';
            oSortviewBtn.onOff=false;
        }
    }
/*点击展开收缩目录树，点击缩略图、列表形式转换 end*/
/*左侧添加移入*/
var oUpload_dropdown = document.getElementById('upload_dropdown');
var oUpload_dropdown_menu = document.getElementById('upload_dropdown_menu');
oUpload_dropdown.onmouseover = oUpload_dropdown_menu.onmouseover = function(){
        clearTimeout(oUpload_dropdown.timer);
        oUpload_dropdown_menu.style.display="block";
    }
oUpload_dropdown.onmouseout = oUpload_dropdown_menu.onmouseout = function(){
    oUpload_dropdown.timer=setTimeout(function(){
        oUpload_dropdown_menu.style.display='none';
    },200);
}
/*左侧添加按钮移入 end*/
/*左侧菜单点击*/

var oSidenav = document.getElementById('sidenav');
var aA = oSidenav.getElementsByTagName('a');
for(var i=0;i<aA.length;i++){
    aA[i].onclick = function(){
        for(var i=0;i<aA.length;i++){
            removeClass(aA[i],'current');
        }
        document.body.className='module-'+this.className;
        addClass(this,'current');
    }
}
var aToolbar = getByClassName(document,'div','toolbar');

var oDoc = getByClassName(oSidenav,'a','doc')[0];
var oDocToolbar = getByClassName(document,'div','sort-doc-toolbar')[0];

//oDoc.onclick=function(){
    //document.body.className='module-doc';
//}


/*左侧菜单点击 end*/

/* 左侧滚动条 */

var oSidebox = document.getElementById('sidebox');
var oSidenav_box = document.getElementById('side_nav_box');
var oSide_scrollbar = document.getElementById('side_scrollbar');
var oSbar = oSide_scrollbar.getElementsByTagName('div')[0];

oSidebox.onmouseover = function(){
    oSide_scrollbar.style.display = 'block';
    oSbar.onmouseover = function(){
        addClass(oSbar,'bar-hover');
    }
}
oSbar.onmouseout = function(){
    removeClass(oSbar,'bar-hover');
}
oSidebox.onmouseout =function(){
    oSide_scrollbar.style.display = 'none';
}

var t = 0,scale,iH,minTop,maxTop;

fnOnresize();

window.onresize = fnOnresize; 
function fnOnresize(){

    if(oSidebox.clientHeight-parseInt(oSidenav_box.style.top) > oSidenav_box.offsetHeight){
        oSidenav_box.style.top = oSidebox.clientHeight - oSidenav_box.offsetHeight + 'px';
    }

    var tScale = t/oSidebox.clientHeight;


    oSidebox.style.height = view().h - 110 + 'px';
    // 目录树及主体高度控制
    oSideBarList.style.height = view().h - 110 + 'px';
    oFiles.style.height = view().h - 140 + 'px';

    scale = oSidebox.clientHeight / oSidenav_box.offsetHeight;   

    scale = scale > 1 ? 1 : scale;
    iH = scale * oSidebox.clientHeight;
    minTop = oSidebox.clientHeight - oSidenav_box.offsetHeight;
    maxTop = oSidebox.clientHeight - iH;
    oSbar.style.height = iH + 'px';

    if( scale == 1 ){
        oSbar.style.display = 'none';
    }

    t = tScale * oSidebox.clientHeight;

    oSbar.style.top = t + 'px';


    //oSidebox.clientHeight + oSidenav_box.style.top  > oSidenav_box.clientHeight =>oSidenav_box.style.top = oSidenav_box.clientHeight - oSidebox.clientHeight;
    //

    
};

oSbar.onmousedown = function( ev ){   
    var ev = ev || event;
    var disY = ev.clientY - this.offsetTop;
    
    document.onmousemove = function( ev ){        
        var ev = ev || event;       
        t = ev.clientY - disY;
        
        if( t < 0 ) t = 0;
        if( t >= maxTop ) t = maxTop;
        
        fnScroll();
        
    };
    
    document.onmouseup = function(){       
        document.onmousemove = document.onmouseup = null;           
    };      
    
    return false;
    
};

oSidebox.onmousewheel = mouseScroll;
if( oSidebox.addEventListener ){
    oSidebox.addEventListener('DOMMouseScroll',mouseScroll);
}

function fnScroll(){   
    scale = t / maxTop; 
    var t2 = minTop * scale;        
    oSbar.style.top = t + 'px';
    oSidenav_box.style.top = t2 + 'px';
    
}

function mouseScroll( ev ){   
    var ev = ev || event;
    var bDown = true;   //true 向下滚动了鼠标   false 向上滚动了鼠标。  
    if( ev.detail ){     
        bDown = ev.detail < 0 ? false : true;      
    }else{
        bDown = ev.wheelDelta < 0 ? true : false;      
    }   
    if( bDown ){   
        t += 20;
        if( t >= maxTop ) t = maxTop;      
    }else{       
        t -= 20;
        if( t <= 0 ) t = 0;       
    } 

    fnScroll();

    if( ev.preventDefault ) {
        ev.preventDefault();
    }   
    return false;
    
}

function view(){
    return {
        w : document.documentElement.clientWidth,
        h : document.documentElement.clientHeight
    };  
}
/* 左侧滚动条 end */

/* 头部app提示 */
var oDownload_app = getByClassName(document,'div','app')[0];
var oDownload_iphone = getByClassName(oDownload_app,'a','iphone')[0];
var oDownload_android = getByClassName(oDownload_app,'a','android')[0];

var oTip_iphone = getByClassName(oDownload_app,'div','tip_ios')[0];
var oTip_android = getByClassName(oDownload_app,'div','tip_android')[0];

Sethover(oDownload_iphone,oTip_iphone);
Sethover(oDownload_android,oTip_android);

// 鼠标移入obj中，ohover显示，移除隐藏，需要定时器控制
function Sethover(obj,ohover){
    obj.onmouseover = ohover.onmouseover = function(){
        clearTimeout(obj.timer);
        ohover.style.display="block";
    }
    obj.onmouseout = ohover.onmouseout = function(){
        obj.timer=setTimeout(function(){
            ohover.style.display='none';
        },100);
    }
}

var oFullPop = getByClassName(document,'div','full-pop')[0];
var oUiMask = getByClassName(document,'div','ui-mask')[0];
var oPopClose = getByClassName(oFullPop,'a','full-pop-close')[0];

oTip_android.onclick = function(){
    oFullPop.style.display = oUiMask.style.display = 'block';   
}
oPopClose.onclick = function(){
    oFullPop.style.display = oUiMask.style.display = 'none';   
}
oUiMask.onmousemove = function(ev){
    var ev = ev || event;
    ev.cancelBubble = true;
}
var oPopHeader = getByClassName(oFullPop,'a','full-pop-header')[0];

//new Drag2(oFullPop);
/* 头部app提示 end */



/* 左侧最下面app安装下载弹窗 */



/* 左侧最下面app安装下载弹窗 end */





    /*docmentFiles功能*/
    var oDocmentFiles = document.getElementById('docmentFiles');
    var docmentDf = f.getDocXlsPptPdf();
    //oDocmentFiles区域数据
    function createViewDocmentFiles(dDf){
        for (var i=0; i<dDf.length; i++) {
            createDocmentFiles(dDf[i]);
        }
    }
    //处理oDocmentFiles区域数据
    function createDocmentFiles(){}
    // <div class="list clear">
    //     <label aria-label="10月下前端知识集-月刊.pdf" class="checkbox"></label>
    //     <span class="img"><i class="filetype icon-pdf"></i></span>
    //     <span class="name"><p class="text"><em title="10月下前端知识集-月刊.pdf">10月下前端知识集-月刊</em></p></span>    
    //     <span class="tool">
    //         <a href="#" title="删除" class="link-del"><i class="ico-del"></i></a>
    //         <a href="#" title="重命名" class="link-rename"><i class="ico-rename"></i></a>
    //         <a href="#" title="分享" class="link-share"><i class="ico-share"></i></a>
    //         <a href="#" title="下载" class="link-download"><i class="ico-download"></i></a>
    //     </span>                                    
    //     <span class="size">416.1K</span>
    //     <span class="time">2014-11-09 13:45:44</span>                
    //     <span class="dimensional">
    //         <a href="#" title="二维码" class="link-dimensional"><i class="ico-dimensional"></i></a>
    //     </span>
    // </div>

}