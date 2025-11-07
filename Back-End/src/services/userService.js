import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/userRepository.js";
import { UserDTO } from "../dtos/userDTO.js";

const { hash } = bcrypt;

export class UserService{
    constructor(){
        this.UserRepository = new UserRepository();
    }


    register = async (userData) => {
        //implementar o findByEmail
        const userExists = await this.UserRepository.findByEmail(userData.email)

        if (userExists){
            throw new Error("Usuario ja cadastrado")

        }
        const passwordHash = await hash(userData.password, 8)
        const userToCreate = {
            name: userData.name,
            email: userData.email,
            password: passwordHash,
        }
        const createdUser = await this.UserRepository.create(userToCreate);
        return new UserDTO(createdUser)
    }

    getAllUser = async () => {
        return await this.UserRepository.findAll();
    }
    getUserById = async (id) => {
        const foundUser = await this.UserRepository.findById(id);
        if (!foundUser){
            throw new Error("User não encontrado!")
        }
        return foundUser
    }
    updateUser = async (id, UserData) => {
        const updatedUser = await this.UserRepository.update(id, UserData);
        if (!updatedUser){
            throw new Error("Autor não encontrado!")
        }
        return updatedUser
    }
    deleteUser = async (id) => {
        const deleteUser = await this.UserRepository.delete(id);
        if (!deleteUser){
            throw new Error("Autor não encontrado!")
        }
        return deleteUser
    }



}
