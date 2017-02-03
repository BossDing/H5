'use strict';

let mongoose = require('mongoose');
let UserMusics = mongoose.model('UserMusics');
let UserImages = mongoose.model('UserImages');
let UserDesigns = mongoose.model('UserDesigns');
let fs = require('fs');

let createPage = function(name,designInfos){
	console.log(name)
	console.log(designInfos)
	let path = __dirname+'/../../userData/pages/'+name+'.html';
	let body = 'test'
	let content = '<!DOCTYPE html> ' +
				'<html> ' +
				'<head> <title> ' + 'title' + '</title> ' +
				'</head>' +
				'<body> ' + body +
				'</body>' +
				'</html>';
	fs.writeFile( path, content,function(err){
        if(err) throw err;
        console.log('createPage has finished,the path is '+path+'.');
    });
};

module.exports = {
	/**
	 * 用户登出
	 *
	 * 用户登出接口，释放资源
	 *
	 * @param    req 
	 * @param    res 
	 * @param    next 
	 * @returns  void
	 *
	 * @date     2017-1-14
	 * @author   Cao Yang
	 */
	logout(req,res,next){
		delete req.session.user;
		res.json({result: true});
	},

	/**
	 * 获取所有音乐
	 *
	 * 获取用户上传的所有音乐的列表
	 *
	 * @param    req 
	 * @param    res 
	 * @param    next 
	 * @returns  void
	 *
	 * @date     2017-1-14
	 * @author   Cao Yang
	 */
	getAllUserMusics(req, res, next){
		UserMusics.find({userName: req.session.user.userName}, null,{}, (err, result) => {
			if (err) {
				console.log('getAllUserMusics err!' + err);
        		res.json({result: false, content: '查询失败'});
        		return next(err);
			}
			else{
				let params = [];
				result.forEach((item, index) => {
					params.push({
						id: item._id,
						musicName: item.musicName,
					})
				})
				res.json({result: true, params});
			}
		})
	},

	/**
	 * 删除用户音乐
	 *
	 * 删除用户音乐接口
	 *
	 * @param    req 
	 * @param    res 
	 * @param    next 
	 * @returns  void
	 *
	 * @date     2017-1-14
	 * @author   Cao Yang
	 */
	 delUserMusics(req, res, next){
	 	let szId = req.body.params.id || [];
	 	(typeof szId === 'string') && (szId = [szId]);

	 	szId.forEach(id => {
	 		UserMusics.findById(id, (err, result) => {
	 			if (result.userName === req.session.user.userName) {/*校验用户是否是自己*/
	 				result.remove(err => {
						if (err) {
							console.log('delUserMusics err!' + err);
			        		res.json({result: false, content: '删除失败'});
			        		return next(err);
						}
						else{
							fs.unlinkSync(result.path);
						}
	 				})
	 			}
	 		});
	 	})

	 	res.json({result: true});
	 },

	 /**
	 * 获取所有图片
	 *
	 * 获取用户上传的所有图片的列表
	 *
	 * @param    req 
	 * @param    res 
	 * @param    next 
	 * @returns  void
	 *
	 * @date     2017-1-14
	 * @author   Cao Yang
	 */
	getAllUserImages(req, res, next){
		UserImages.find({userName: req.session.user.userName}, null,{}, (err, result) => {
			if (err) {
				console.log('getAllUserImages err!' + err);
        		res.json({result: false, content: '查询失败'});
        		return next(err);
			}
			else{
				let params = [];
				result.forEach((item, index) => {
					params.push({
						id: item._id,
					})
				})
				res.json({result: true, params});
			}
		})
	},

	/**
	 * 删除用户图片
	 *
	 * 删除用户图片接口
	 *
	 * @param    req 
	 * @param    res 
	 * @param    next 
	 * @returns  void
	 *
	 * @date     2017-1-29
	 * @author   Cao Yang
	 */
	 delUserImages(req, res, next){
	 	let szId = req.body.params.id || [];
	 	(typeof szId === 'string') && (szId = [szId]);

	 	szId.forEach(id => {
	 		UserImages.findById(id, (err, result) => {
	 			if (result.userName === req.session.user.userName) {/*校验用户是否是自己*/
	 				result.remove(err => {
						if (err) {
							console.log('delUserImages err!' + err);
			        		res.json({result: false, content: '删除失败'});
			        		return next(err);
						}
						else{
							fs.unlinkSync(result.path);
						}
	 				})
	 			}
	 		});
	 	})

	 	res.json({result: true});
	 },

	 
	 /**
	 * 保存用户设计界面
	 *
	 * 保存用户设计界面接口
	 *
	 * @param    req 
	 * @param    res 
	 * @param    next 
	 * @returns  void
	 *
	 * @date     2017-1-29
	 * @author   Cao Yang
	 */
	 saveDesign(req, res, next){
	 	//console.log(req.body.params.name)
	 	//console.log(req.body.params.designInfos)

	 	UserDesigns.find({
	 						userName: req.session.user.userName,
	 						workName: req.body.params.name,
	 					}, null,{}, (err, result) => {
			if (err) {
				console.log('saveDesign err!' + err);
        		res.json({result: false, content: '保存失败'});
        		return next(err);
			}
			else{
				if (result.length) {
					/*修改数据*/
					result[0].designInfos = req.body.params.designInfos;
					result[0].save(err => {
						if (err) {
		            		console.log('saveDesign modify err!' + err);
		            		res.json({result: false, content: '保存失败'});
		            		return next(err);
		            	}
		            	else{
		            		if (createPage(result[0].workName, result[0].designInfos)) {
		            			res.json({result: true});
		            		}
		            		else{
		            			res.json({result: false, content: '创建页面失败'});
		            		}
		            	}
					})
				}
				else{
					/*第一次保存*/
					let design = new UserDesigns({
						userName: req.session.user.userName,
						workName: req.body.params.name,
						designInfos: req.body.params.designInfos,
					});

					design.save(function(err){
		            	if (err) {
		            		console.log('saveDesign err!' + err);
		            		res.json({result: false, content: '保存失败'});
		            		return next(err);
		            	}
		            	else{
		            		if (createPage(req.body.params.name, req.body.params.designInfos)) {
		            			res.json({result: true});
		            		}
		            		else{
		            			res.json({result: false, content: '创建页面失败'});
		            		}
		            	}
		            })
				}
			}
		})
	 },
}






