//Data Transfer Object
export class UserDTO{
    constructor(User){
        this.id = User._id;
        this.name = User.name;
        this.email = User.email;
        this.password = User.password;
        this.createdAt = User.createdAt;
        this.updateAt = User.updatedAt;
    }

    static fromRequest(body){
        return{
            id: body.id,
            name: body.name,
            email: body.email,
            password: body.password
            
        };
    }
}