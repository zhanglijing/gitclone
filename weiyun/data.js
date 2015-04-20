/**
 * Created by zmouse on 2014/12/18.
 */
//存放文件信息
var fileData = [
    {
        id : 11,
        pid : 0,
        name : '小说',
        type : 'folder'
    },
    {
        id : 2,
        pid : 0,
        name : 'appliaction',
        type : 'folder'
    },
    {
        id : 3,
        pid : 4,
        name : 'angularjs',
        type : 'folder'
    },
    {
        id : 4,
        pid : 0,
        name : 'javascript',
        type : 'folder'
    },
    {
        id : 5,
        pid : 0,
        name : 'miaov_app',
        type : 'folder'
    },
    {
        id : 6,
        pid : 4,
        name : 'jquery',
        type : 'folder'
    },
    {
        id : 7,
        pid : 4,
        name : 'ECMAScript',
        type : 'folder'
    },
    {
        id : 8,
        pid : 11,
        name : '侦探小说',
        type : 'folder'
    },
    {
        id : 9,
        pid : 7,
        name : 'ECMAScript手册',
        type : 'pdf'
    },
    {
        id : 10,
        pid : 7,
        name : 'ECMAScript语言参考',
        type : 'txt'
    },
    {
        id : 1,
        pid : 8,
        name : 'ECMAScript语言参考',
        type : 'folder'
    }
];

//存放文件类型对应的class
var typeData = {
    'folder': 'icon-folder',
    'pdf': 'icon-pdf',
    'txt': 'icon-txt',
    'file': 'ico-file'
}