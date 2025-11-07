import { BaseRepository } from "./baseRepository.js";
import { user } from "../models/User.js";

export class UserRepository extends BaseRepository {
    constructor(){
        super(user)
    }

    async findByEmail(email){
        return await this.model.findOne({ email });
    }

}