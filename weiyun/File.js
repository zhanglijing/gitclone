/**
 * Created by zmouse on 2014/12/18.
 */

//参数为数组，定义文件对象
function File(dataList) {
    this.dataList = [];
    this.length = dataList.length;
    this.init(dataList);
}
//参数为数组，初始化dataList里的数据,根据id号来决定存放到数组里什么位置
File.prototype.init = function(dataList) {
    for (var i=0; i<dataList.length; i++) {
        if(dataList[i])this.dataList[dataList[i].id] = dataList[i];
    }
}
//参数为id号，得到当前文件的子文件并且子文件类型为folder。
File.prototype.getFolderChildren = function(id) {
    var arr = [];
    for (var i in this.dataList) {
        if (this.dataList[i] && this.dataList[i].pid == id && this.dataList[i].type == 'folder') {
            arr.push(this.dataList[i]);
        }
    }
    return arr;
}

//参数为id号，判断当前文件是否为父级文件,且子文件类型有为folder。
File.prototype.isFolderParent = function(id) {
    return !!this.getFolderChildren(id).length; //若该文件存在子文件，说明该文件为父级文件，否则相反。
}
//参数为id号，得到当前文件的子文件。
File.prototype.getChildren = function(id) {
    var arr = [];
    for (var i in this.dataList) {
        if (this.dataList[i] && this.dataList[i].pid == id) {
            arr.push(this.dataList[i]);
        }
    }
    return arr;
}

//参数为id号，判断当前文件是否为父级文件。
File.prototype.isParent = function(id) {
    return !!this.getChildren(id).length; //若该文件存在子文件，说明该文件为父级文件，否则相反。
}



//参数为id号，得到当前文件的父级一直到最顶级的文件，类型都为folder。
File.prototype.getSelfAndParents = function(id) {
    var arr = [];
    var obj = this.getInfo(id);
    if(obj.type=='folder')arr.unshift(obj);
    while(obj.pid!=0){
        for (var i in this.dataList) {
            if (this.dataList[i] && this.dataList[i].id == obj.pid && this.dataList[i].type == 'folder') {
                obj = this.dataList[i];
                arr.unshift(obj);
            }
        }
    }  
    return arr;
}
//参数为id号，得到当前文件的相关信息。
File.prototype.getInfo = function(id) {
    var obj = null;
    for (var i in this.dataList) {
        if (this.dataList[i] && this.dataList[i].id == id) {
            obj=this.dataList[i];
        }
    }
    return obj;
}
//得到当前数据
File.prototype.getData = function(){
    return this.dataList;
}
//参数为id号，作用：根据id删除对应的相关文件。
File.prototype.deleteData = function(id){
    this.dataList[id] = null;
    for (var i in this.dataList) {
        if (this.dataList[i] && this.dataList[i].pid == id) {
            this.deleteData(this.dataList[i].id);
        }
    }
}
//第一个参数为id号，第二个参数为新名字，作用：重命名。
File.prototype.reName = function(id, newname){
    for (var i in this.dataList) {
        if (this.dataList[i] && this.dataList[i].id == id) {
            console.log(this.dataList[i].name);
            this.dataList[i].name = newname;
        }
    }
}
//返回一个新生成文件的id号
File.prototype.newId = function(){
    var newid = -1;
    for (var i in this.dataList) {
        if (this.dataList[i] && this.dataList[i].id > newid) {
            newid = this.dataList[i].id;
        }
    }
    return ++newid;
}
//第一个参数为id号，第二个参数为pid,第三个参数为名字，第四个参数为类型，作用：新添加一个文件。
File.prototype.addData = function(newid, newpid, newname, newtype){
    this.dataList[newid] = {
        id : newid,
        name : newname,
        pid : newpid,       
        type : newtype || 'folder'
    }
    return this.dataList[newid];
}

//第一个参数为要移动文件id号，第二个参数为要移动文件的新pid号(即要移动到哪个文件夹下的id号) ，作用：移动文件。
File.prototype.reMove = function(id, newpid){
    for (var i in this.dataList) {
        if (this.dataList[i] && this.dataList[i].id == id) {
            this.dataList[i].pid = newpid;
        }
    }
}