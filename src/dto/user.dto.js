class UserDTO{
    constructor(user){
        this._id = user._id;
        this.Name = user.Name;
        this.userName = user.userName;
        this.Email = user.Email;
        this.Password = user.Password;
        this.PhoneNo =  user.PhoneNo;
        this.role = user.role;
    }
}

export default UserDTO ;