from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import openai
import time
import json
import requests
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sqlalchemy import Date
from datetime import datetime, date, timedelta
from flask_socketio import SocketIO
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # 允许所有路由的 CORS
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")
# 请求频率限制
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["10000 per day", "5000 per hour"]
)

# 数据库配置（MySQL 示例）
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:ljx123456@localhost:3306/moodBuilder'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)


doctor_user_association = db.Table(
    'doctor_user',
    db.Column('doctor_id', db.Integer, db.ForeignKey('doctors.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('created_at', db.DateTime, default=db.func.current_timestamp())  # 关联建立时间
)

#doctor表
class Doctor(db.Model):
    __tablename__ = 'doctors'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=True)
    phonenumber = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # 关系：通过中间表关联到用户
    users = db.relationship('User', secondary=doctor_user_association, backref=db.backref('doctors', lazy='dynamic'))

    def __repr__(self):
        return f"<Doctor {self.username}>"
    


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    gender = db.Column(db.String(10), nullable=True)  # 新增性别字段
    birthdate = db.Column(db.Date, nullable=True)     # 新增出生日期字段

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, nullable=False)  # 发送者的 ID
    receiver_id = db.Column(db.Integer, nullable=False)  # 接收者的 ID
    content = db.Column(db.String(255), nullable=False)  # 消息内容
    message_type = db.Column(db.Integer, nullable=False, default=0)  # 消息类型（0: 病人 -> 医生, 1: 医生 -> 病人）
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())  # 发送时间

class Mood(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 关联到User表
    mood = db.Column(db.String(255), nullable=False)  # 心情类型，比如"angry", "happy"等
    created_at = db.Column(db.Date, default=db.func.current_date())  # 心情记录的时间

    user = db.relationship('User', backref=db.backref('moods', lazy=True))
class MentalData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 关联到User表
   
    guilt_value = db.Column(db.Integer, nullable=False)  # 对应的 guilt 值（4, 3, 2, 1, 0）
    sleep_value = db.Column(db.Integer, nullable=False)  # 对应的 sleep 值（4, 3, 2, 1, 0）
    eating_value = db.Column(db.Integer, nullable=False)  # 对应的 eating 值（4, 3, 2, 1, 0）
    body_value = db.Column(db.Integer, nullable=False)  # 对应的 body 值（4, 3, 2, 1, 0）
    mental_value = db.Column(db.Integer, nullable=False)  # 对应的 mental 值（4, 3, 2, 1, 0）
    hesitation_value = db.Column(db.Integer, nullable=False)  # 对应的 hesitation 值（4, 3, 2, 1, 0）

    created_at = db.Column(db.Date, default=db.func.current_date())  # 心情记录的时间

    user = db.relationship('User', backref=db.backref('mentalData', lazy=True))
class Diary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 关联到User表
    diary = db.Column(db.String(528), nullable=False)  # 心情日记
    created_at = db.Column(db.Date, default=db.func.current_date())  # 记录时间
    is_public = db.Column(db.Boolean, default=False)  # 是否公开
    user = db.relationship('User', backref=db.backref('diaries', lazy=True))  # 修改backref为'diaries'

class MoodImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    image_data = db.Column(db.Text, nullable=False)  
    created_at = db.Column(db.Date, default=db.func.current_date())

    user = db.relationship('User', backref=db.backref('canvas_images', lazy=True))

class MoodTree(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    image_data = db.Column(db.Text, nullable=False) 
    created_at = db.Column(db.Date, default=db.func.current_date())

    user = db.relationship('User', backref=db.backref('mood_tree', lazy=True))
class MoodPuzzle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    image_data = db.Column(db.Text, nullable=False) 
    created_at = db.Column(db.Date, default=db.func.current_date())

    user = db.relationship('User', backref=db.backref('mood_puzzle', lazy=True))

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 评论人
    diary_id = db.Column(db.Integer, db.ForeignKey('diary.id'), nullable=False)  # 所属日记
    comment = db.Column(db.String(1024), nullable=False)  # 评论内容
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())  # 评论时间

    user = db.relationship('User', backref=db.backref('comments', lazy=True))
    diary = db.relationship('Diary', backref=db.backref('comments', lazy=True))


class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 点赞人
    diary_id = db.Column(db.Integer, db.ForeignKey('diary.id'), nullable=False)  # 所属日记
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())  # 点赞时间

    user = db.relationship('User', backref=db.backref('likes', lazy=True))
    diary = db.relationship('Diary', backref=db.backref('likes', lazy=True))
#上传评论
@app.route('/api/add_comment', methods=['POST'])
def add_comment():
    user_id = request.json.get('user_id')
    diary_id = request.json.get('diary_id')
    comment = request.json.get('comment')

    if not user_id or not diary_id or not comment:
        return jsonify({'error': 'Missing required parameters.'}), 400

    new_comment = Comment(user_id=user_id, diary_id=diary_id, comment=comment)
    db.session.add(new_comment)
    db.session.commit()

    return jsonify({'message': 'Comment added successfully.'}), 201
#取消评论
@app.route('/api/delete_comment', methods=['DELETE'])
def delete_comment():
    comment_id = request.json.get('comment_id')
    user_id = request.json.get('user_id')

    comment = Comment.query.filter_by(id=comment_id, user_id=user_id).first()

    if not comment:
        return jsonify({'error': 'Comment not found or permission denied.'}), 404

    db.session.delete(comment)
    db.session.commit()

    return jsonify({'message': 'Comment deleted successfully.'}), 200


#点赞
@app.route('/api/like_diary', methods=['POST'])
def like_diary():
    user_id = request.json.get('user_id')
    diary_id = request.json.get('diary_id')

    if not user_id or not diary_id:
        return jsonify({'error': 'Missing required parameters.'}), 400

    # 检查用户是否已经点赞过
    existing_like = Like.query.filter_by(user_id=user_id, diary_id=diary_id).first()
    if existing_like:
        return jsonify({'error': 'Already liked.'}), 400

    new_like = Like(user_id=user_id, diary_id=diary_id)
    db.session.add(new_like)
    db.session.commit()

    return jsonify({'message': 'Diary liked successfully.'}), 201
#取消点赞
@app.route('/api/unlike_diary', methods=['DELETE'])
def unlike_diary():
    user_id = request.json.get('user_id')
    diary_id = request.json.get('diary_id')

    like = Like.query.filter_by(user_id=user_id, diary_id=diary_id).first()

    if not like:
        return jsonify({'error': 'Like not found.'}), 404

    db.session.delete(like)
    db.session.commit()

    return jsonify({'message': 'Like removed successfully.'}), 200

# 注册
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], password=hashed_password, email=data['email'],gender=data['gender'],birthdate=data['birthdate'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully!"}), 201

# 登录
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({
            "message": "Login successful!",
            "user_id": user.id  # 返回用户的 ID
        })
    else:
        return jsonify({"message": "Invalid credentials"}), 401

# 获取特定日期范围内的心情数据
@app.route('/api/moods/<int:user_id>', methods=['GET'])

def get_user_moods(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    start_date = request.args.get('start_date', date.today().replace(day=1))
    end_date = request.args.get('end_date', date.today())
    
    moods = Mood.query.filter_by(user_id=user_id).filter(Mood.created_at.between(start_date, end_date)).all()
    mood_list = [{"mood": mood.mood, "created_at": mood.created_at} for mood in moods]
    
    return jsonify({"moods": mood_list}), 200

# 上传心情数据
@app.route('/api/mood', methods=['POST'])

def record_mood():
    data = request.get_json()
    
    user_id = data.get('user_id')
    mood_type = data.get('mood')
    
    if not user_id or not mood_type:
        return jsonify({"message": "User ID and Mood are required"}), 400

    today = date.today()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    existing_mood = Mood.query.filter_by(user_id=user_id, created_at=today).first()

    if existing_mood:
        existing_mood.mood = mood_type
        db.session.commit()
        message = "Mood updated successfully!"
    else:
        new_mood = Mood(user_id=user_id, mood=mood_type, created_at=today)
        db.session.add(new_mood)
        db.session.commit()
        message = "Mood recorded successfully!"
    
    # Emit the update to all connected clients
    socketio.emit('mood_update', {'status': 'updated', 'user_id': user_id})
    
    return jsonify({"message": message}), 200

# 上传mental数据
@app.route('/api/save_mentalData', methods=['POST'])

def record_mentalData():
    data = request.get_json()
    
    user_id = data.get('user_id')
    guilty_answer = data.get('guilt_answer')
    sleep_answer = data.get('sleep_answer')
    eating_answer = data.get('eating_answer')
    mental_answer = data.get('mental_answer')
    body_answer = data.get('body_answer')
    hesitate_answer = data.get('hesitate_answer')
    
    if not user_id :
        return jsonify({"message": "User ID and Mood are required"}), 400

    today = date.today()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    existing_mentalData = MentalData.query.filter_by(user_id=user_id, created_at=today).first()

    if existing_mentalData:
        existing_mentalData.guilt_value = guilty_answer
        existing_mentalData.sleep_value = sleep_answer
        existing_mentalData.eating_value = eating_answer
        existing_mentalData.mental_value = mental_answer
        existing_mentalData.body_value = body_answer
        existing_mentalData.hesitation_value = hesitate_answer
        db.session.commit()
        message = "Mood updated successfully!"
    else:
        new_mentalData = MentalData(user_id=user_id, 
                                    guilt_value=guilty_answer,
                                    sleep_value=sleep_answer, 
                                    eating_value=eating_answer, 
                                    mental_value=mental_answer, 
                                    body_value=body_answer, 
                                    hesitation_value=hesitate_answer, 
                                    created_at=today)
        db.session.add(new_mentalData)
        db.session.commit()
        message = "Mood recorded successfully!"
    
    # Emit the update to all connected clients
    socketio.emit('mentalData_update', {'status': 'updated', 'user_id': user_id})
    
    return jsonify({"message": message}), 200


#上传心情日记
from datetime import date

@app.route('/api/save_diary', methods=['POST'])
def save_diary():
    data = request.get_json()
    user_id = data.get('user_id')
    diary_content = data.get('diary')
    is_public = data.get('is_public', False)  # Default to False if not provided

    if not user_id or not diary_content:
        return jsonify({'error': 'User ID and diary content are required.'}), 400

    # 假设Diary模型有user_id和date字段
    today = date.today()

    # 检查是否已经存在该用户当天的日记
    existing_diary = Diary.query.filter_by(user_id=user_id,created_at=today).first()

    if existing_diary:
        # 如果当天已存在日记，更新内容
        existing_diary.diary = diary_content
        existing_diary.is_public=is_public
        message = 'Diary updated successfully!'
    else:
        # 否则创建新的日记
        new_diary = Diary(user_id=user_id, diary=diary_content,created_at=today,is_public=is_public)
        db.session.add(new_diary)
        message = 'Diary saved successfully!'

    db.session.commit()

    # 通知客户端更新
    socketio.emit('mood_diary_update', {'status': 'updated', 'user_id': user_id})

    return jsonify({'message': message}), 201


# 获取某一时间段的日记记录的接口
@app.route('/api/get_diaries', methods=['GET'])
def get_diaries():
    user_id = request.args.get('user_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if not user_id or not start_date or not end_date:
        return jsonify({'error': 'User ID, start date, and end date are required.'}), 400

    try:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    diaries = Diary.query.filter(Diary.user_id == user_id, 
                                 Diary.created_at >= start_date, 
                                 Diary.created_at <= end_date).order_by(Diary.created_at.desc()).all()

    result = [{'id': diary.id, 'diary': diary.diary, 'created_at': diary.created_at.strftime('%Y-%m-%d')} for diary in diaries]

    return jsonify(result), 200

@app.route('/api/get_public_diaries', methods=['GET'])
def get_public_diaries():
    user_id = request.args.get('user_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # 验证必要的参数
    if not user_id or not start_date or not end_date:
        return jsonify({'error': 'User ID, start date, and end date are required.'}), 400

    # 检查日期格式是否正确
    try:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    # 查询公开日记
    diaries = Diary.query.join(User).filter(
        Diary.user_id != user_id,  # 排除自己的日记
        Diary.is_public == True,  # 只查询公开的日记
        Diary.created_at >= start_date,  # 起始日期
        Diary.created_at <= end_date  # 结束日期
    ).order_by(Diary.created_at.desc()).all()

    result = []

    for diary in diaries:
        # 查询每条日记的评论及评论人信息
        comments = [{
            'comment': comment.comment,
            'username': comment.user.username,
            'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M'),

        } for comment in diary.comments]

        # 获取该日记的点赞总数
        likes_count = Like.query.filter_by(diary_id=diary.id).count()

        result.append({
            'id': diary.id,
            'diary': diary.diary,
            'created_at': diary.created_at.strftime('%Y-%m-%d'),
            'username': diary.user.username,  # 返回作者用户名
            'comments': comments,  # 返回评论列表
            'likes_count': likes_count  # 返回日记的点赞总数
        })

    return jsonify(result), 200



@app.route('/api/save_mood_image', methods=['POST'])
def save_mood_image():
    data = request.get_json()
    user_id = data.get('user_id')
    image_data = data.get('image_data')
    
    if not user_id or not image_data:
        return jsonify({'error': 'User ID and image data are required.'}), 400

    today_date = date.today()

    try:
        # 查找今天之前的最近一条记录
        latest_existing_record = MoodTree.query.filter(
            MoodTree.user_id == user_id,
            MoodTree.created_at < today_date
        ).order_by(MoodTree.created_at.desc()).first()

        # 如果找到最近的记录，使用它的数据填充空白日期
        if latest_existing_record:
            last_filled_date = latest_existing_record.created_at
            current_fill_date = last_filled_date + timedelta(days=1)

            while current_fill_date < today_date:
                # 查找当前需要填充的日期是否有记录
                existing_record = MoodTree.query.filter_by(user_id=user_id, created_at=current_fill_date).first()
                
                if not existing_record:
                    # 创建新的记录，使用最近的有效数据填充
                    new_mood_tree = MoodTree(
                        user_id=user_id,
                        image_data=latest_existing_record.image_data,  # 使用最近的有效数据
                        created_at=current_fill_date
                    )
                    db.session.add(new_mood_tree)
                
                current_fill_date += timedelta(days=1)
        
        # 查找当天的图像记录
        existing_record = MoodTree.query.filter_by(user_id=user_id, created_at=today_date).first()

        if existing_record:
            # 如果当天记录存在，更新图像数据
            existing_record.image_data = image_data
            db.session.commit()
            # 通知客户端更新
            socketio.emit('mood_tree_update', {'status': 'updated', 'user_id': user_id})
            return jsonify({'message': 'Canvas image updated successfully!'}), 200
        else:
            # 如果当天记录不存在，创建新的记录
            mood_tree = MoodTree(user_id=user_id, image_data=image_data, created_at=today_date)
            db.session.add(mood_tree)
            db.session.commit()
            # 通知客户端更新
            socketio.emit('mood_tree_update', {'status': 'created', 'user_id': user_id})
            return jsonify({'message': 'Canvas image saved successfully!'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/save_mood_puzzle', methods=['POST'])
def save_mood_puzzle():
    data = request.get_json()
    user_id = data.get('user_id')
    image_data = data.get('image_data')
    
    if not user_id or not image_data:
        return jsonify({'error': 'User ID and image data are required.'}), 400

    today_date = date.today()

    try:
        # 查找今天之前的最近一条记录
        latest_existing_record = MoodPuzzle.query.filter(
            MoodPuzzle.user_id == user_id,
            MoodPuzzle.created_at < today_date
        ).order_by(MoodPuzzle.created_at.desc()).first()

        # 如果找到最近的记录，使用它的数据填充空白日期
        if latest_existing_record:
            last_filled_date = latest_existing_record.created_at
            current_fill_date = last_filled_date + timedelta(days=1)

            while current_fill_date < today_date:
                # 查找当前需要填充的日期是否有记录
                existing_record = MoodPuzzle.query.filter_by(user_id=user_id, created_at=current_fill_date).first()
                
                if not existing_record:
                    # 创建新的记录，使用最近的有效数据填充
                    new_mood_puzzle = MoodPuzzle(
                        user_id=user_id,
                        image_data=latest_existing_record.image_data,  # 使用最近的有效数据
                        created_at=current_fill_date
                    )
                    db.session.add(new_mood_puzzle)
                
                current_fill_date += timedelta(days=1)
        
        # 查找当天的图像记录
        existing_record = MoodPuzzle.query.filter_by(user_id=user_id, created_at=today_date).first()

        if existing_record:
            # 如果当天记录存在，更新图像数据
            existing_record.image_data = image_data
            db.session.commit()
            # 通知客户端更新
            socketio.emit('mood_puzzle_update', {'status': 'updated', 'user_id': user_id})
            return jsonify({'message': 'Canvas puzzle updated successfully!'}), 200
        else:
            # 如果当天记录不存在，创建新的记录
            mood_puzzle = MoodPuzzle(user_id=user_id, image_data=image_data, created_at=today_date)
            db.session.add(mood_puzzle)
            db.session.commit()
            # 通知客户端更新
            socketio.emit('mood_puzzle_update', {'status': 'created', 'user_id': user_id})
            return jsonify({'message': 'Canvas puzzle saved successfully!'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# 获取某个时间段的图片数据
@app.route('/api/get_images_by_date', methods=['GET'])
def get_images_by_date():
    user_id = request.args.get('user_id')
    start_date_str = request.args.get('start_date')  # 接受 YYYY-MM-DD 格式的日期
    end_date_str = request.args.get('end_date')

    # 将字符串转换为日期对象
    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    # 查询在指定时间范围内的图片数据
    images = MoodImage.query.filter(
        MoodImage.user_id == user_id,
        MoodImage.created_at >= start_date,
        MoodImage.created_at <= end_date
    ).all()

    if images:
        return jsonify([{'image_data': img.image_data, 'created_at': img.created_at} for img in images]), 200
    else:
        return jsonify({'message': 'No images found for this period.'}), 404
# 获取某个时间段的图片数据
@app.route('/api/get_tree_by_date', methods=['GET'])
def get_tree_by_date():
    user_id = request.args.get('user_id')
    start_date_str = request.args.get('start_date')  # 接受 YYYY-MM-DD 格式的日期
    end_date_str = request.args.get('end_date')

    # 将字符串转换为日期对象
    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    # 查询在指定时间范围内的图片数据
    images = MoodTree.query.filter(
        MoodTree.user_id == user_id,
        MoodTree.created_at >= start_date,
        MoodTree.created_at <= end_date
    ).all()

    if images:
        return jsonify([{'image_data': img.image_data, 'created_at': img.created_at} for img in images]), 200
    else:
        return jsonify({'message': 'No images found for this period.'}), 404
@app.route('/api/get_latest_tree_date', methods=['GET'])
def get_latest_tree_date():
    user_id = request.args.get('user_id')

    # 查询用户的最新图片数据
    latest_image = MoodTree.query.filter(MoodTree.user_id == user_id).order_by(MoodTree.created_at.desc()).first()

    if latest_image:
        return jsonify({'latest_date': latest_image.created_at}), 200
    else:
        return jsonify({'message': 'No images found for this user.'}), 404

@app.route('/api/get_latest_tree_before_today', methods=['GET'])
def get_latest_tree_before_today():
    user_id = request.args.get('user_id')

    # 获取今天的日期，忽略时间部分
    today = datetime.now().date()

    # 查询今天之前的最新图片数据
    latest_image_before_today = MoodTree.query.filter(
        MoodTree.user_id == user_id,
        MoodTree.created_at < today  # 添加条件：小于今天的记录
    ).order_by(MoodTree.created_at.desc()).first()

    if latest_image_before_today:
        return jsonify({'latest_date': latest_image_before_today.created_at}), 200
    else:
        return jsonify({'message': 'No images found before today for this user.'}), 404
@app.route('/api/get_latest_puzzle_date', methods=['GET'])
def get_latest_puzzle_date():
    user_id = request.args.get('user_id')

    # 查询用户的最新图片数据
    latest_image = MoodPuzzle.query.filter(MoodPuzzle.user_id == user_id).order_by(MoodPuzzle.created_at.desc()).first()

    if latest_image:
        return jsonify({'latest_date': latest_image.created_at}), 200
    else:
        return jsonify({'message': 'No images found for this user.'}), 404

@app.route("/robot_talk", methods=["POST"])
def robot_talk():
    # 从表单数据中获取问题内容
    user_input = request.form.get('question', '')

    url = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-speed-128k?access_token=" + get_access_token()
    
    payload = json.dumps({
        "messages": [
            {
                "role": "user",
                "content": user_input
            }
        ],
        "stream": False,
        "temperature": 0.9,
        "top_p": 0.7,
        "penalty_score": 1,
        "system": "旅行家",
        "max_output_tokens": 4096,
        "frequency_penalty": 0.1,
        "presence_penalty": 0.0,
    })
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    response = requests.post(url, headers=headers, data=payload)
    
    response_data = response.json()
    
    if 'result' in response_data:
        return jsonify({'text': response_data['result']})
    else:
        return jsonify({'text': "没有返回结果或结果格式不正确。"}), 500

@app.route('/api/get_puzzle_by_date', methods=['GET'])
def get_puzzle_by_date():
    user_id = request.args.get('user_id')
    start_date_str = request.args.get('start_date')  # 接受 YYYY-MM-DD 格式的日期
    end_date_str = request.args.get('end_date')

    # 将字符串转换为日期对象
    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    # 查询在指定时间范围内的图片数据
    puzzles = MoodPuzzle.query.filter(
        MoodPuzzle.user_id == user_id,
        MoodPuzzle.created_at >= start_date,
        MoodPuzzle.created_at <= end_date
    ).all()

    if puzzles:
        return jsonify([{'image_data': puzzle.image_data, 'created_at': puzzle.created_at} for puzzle in puzzles]), 200
    else:
        return jsonify({'message': 'No images found for this period.'}), 404

@app.route('/api/user/<int:user_id>/mood-streak', methods=['GET'])
def get_mood_streak(user_id):
    # 1. 查询用户的所有心情记录，并按日期排序
    moods = Mood.query.filter_by(user_id=user_id).order_by(Mood.created_at).all()
    
    if not moods:
        return jsonify({"message": "No mood records found for this user.", "streak": 0})

    mood_count = len(moods)
    if mood_count < 3:
        total_count = 0
    elif 3 <= mood_count < 8:
        total_count = 1
    elif 8 <= mood_count < 11:
        total_count = 2
    elif 11 <= mood_count < 15:
        total_count = 3
    elif 15 <= mood_count < 17:
        total_count = 4
    elif 17 <= mood_count < 21:
        total_count = 5
    elif 21 <= mood_count < 23:
        total_count = 6
    elif 23 <= mood_count < 26:
        total_count = 7
    elif 26 <= mood_count < 29:
        total_count = 8
    elif 29 <= mood_count < 31:
        total_count = 9
    else:
        total_count = mood_count // 3  # 可按需要调整逻辑
    # 3. 创建包含日期和心情的列表
    mood_data = [{"date": mood.created_at.strftime('%Y-%m-%d'), "mood": mood.mood} for mood in moods]

    # 4. 返回用户ID、总记录数/3和心情记录
    return jsonify({
        "user_id": user_id,
        "max_streak": total_count,
        "mood_records": mood_data
    })

# 查询病人发送的所有消息
@app.route('/api/patient_sent_messages/<int:patient_id>', methods=['GET'])
def get_patient_sent_messages(patient_id):
    messages = Message.query.filter_by(sender_id=patient_id, message_type=0).all()  # 查询发送者是病人的消息
    messages_data = []
    for message in messages:
        messages_data.append({
            'id': message.id,
            'sender_id': message.sender_id,
            'receiver_id': message.receiver_id,
            'content': message.content,
            'created_at': message.created_at,
            'message_type': message.message_type
        })
    return jsonify(messages_data)

# 查询病人收到的所有消息
@app.route('/api/patient_received_messages/<int:patient_id>', methods=['GET'])
def get_patient_received_messages(patient_id):
    messages = Message.query.filter_by(receiver_id=patient_id, message_type=1).all()  # 查询接收者是病人的消息
    messages_data = []
    for message in messages:
        messages_data.append({
            'id': message.id,
            'sender_id': message.sender_id,
            'receiver_id': message.receiver_id,
            'content': message.content,
            'created_at': message.created_at,
            'message_type': message.message_type
        })
    return jsonify(messages_data)


# 病人发送消息给医生的接口
@app.route('/api/send_message', methods=['POST'])
def send_message():
    data = request.get_json()  # 获取传入的 JSON 数据

    patient_id = data.get('patient_id')
    message_content = data.get('content')
    
    # 获取病人对应的医生
    patient = User.query.get(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
    
    doctor = patient.doctors.first()  # 假设每个病人只有一个医生
    if not doctor:
        return jsonify({"error": "No assigned doctor found"}), 404
    
    # 创建消息
    new_message = Message(
        sender_id=patient.id,
        receiver_id=doctor.id,
        content=message_content,
        message_type=0  # 病人 -> 医生
    )
    
    # 保存消息
    db.session.add(new_message)
    db.session.commit()

    return jsonify({"message": "Message sent successfully"}), 200


# 医生登录
@app.route('/api/doctor_login', methods=['POST'])
def doctor_login():
    data = request.get_json()
    doctor = Doctor.query.filter_by(username=data['username']).first()
    if doctor and bcrypt.check_password_hash(doctor.password, data['password']):
        return jsonify({
            "message": "Login successful!",
            "doctor_id": doctor.id  # 返回用户的 ID
        })
    else:
        return jsonify({"message": "Invalid credentials"}), 401

# 医生注册
@app.route('/api/doctor_register', methods=['POST'])
def doctor_register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_doctor = Doctor(username=data['username'], password=hashed_password, email=data['email'],phonenumber=data['phonenumber'])
    db.session.add(new_doctor)
    db.session.commit()
    return jsonify({"message": "User registered successfully!"}), 201   

#查找患者信息
@app.route('/doctor/<int:doctor_id>/patients', methods=['GET'])
def get_patients(doctor_id):
    # 查找医生
    doctor = Doctor.query.filter_by(id=doctor_id).first()
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    # 获取医生关联的用户（患者）
    patients = doctor.users

    # 返回患者信息
    patients_data = []
    for patient in patients:
        patients_data.append({
            "id": patient.id,
            "username": patient.username,
            "email": patient.email,
            "gender": patient.gender,
            "birthdate": patient.birthdate.strftime('%Y-%m-%d') if patient.birthdate else None,
            "created_at": patient.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        })

    return jsonify({"doctor_id": doctor_id, "patients": patients_data}), 200








def get_access_token():
    url = "https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=pV1npR8AuX4vOzHx0YZPsqXa&client_secret=7yOnw4dFHcFX9pBjdrlsnmCOKGbCsVTW"
 
    payload = json.dumps("")
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
 
    response = requests.post(url, headers=headers, data=payload)
    return response.json().get("access_token")

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('mood_update')
def handle_mood_update(data):
    # Broadcast update to all connected clients
    socketio.emit('mood_update', data)
@socketio.on('mood_diary_update')
def handle_mood_update(data):
    # Broadcast update to all connected clients
    socketio.emit('mood_diary_update', data)
@socketio.on('mood_tree_update')
def handle_mood_update(data):
    # Broadcast update to all connected clients
    socketio.emit('mood_tree_update', data)
@socketio.on('mood_puzzle_update')
def handle_mood_update(data):
    # Broadcast update to all connected clients
    socketio.emit('mood_puzzle_update', data)
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    # app.run(debug=True)
    # Use socketio.run() for WebSocket support
    socketio.run(app, debug=True)
