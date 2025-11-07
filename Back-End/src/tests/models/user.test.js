import { describe, expect, it, jest, afterEach } from "@jest/globals"
import userController from "../../controllers/userController.js";
import * as UserModule from "../../models/User.js"

jest.mock("../../models/User.js")

describe("Testando o User Controller", () => {

    const mockRequest = (data = {}, params = {}) => ({ body: data, params });
    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.send = jest.fn().mockReturnValue(res);
        return res;
    }
    afterEach(() => {
        jest.clearAllMocks();
    })

    it("Deve listar todos os nomes", async () => {
        const UserMock = [
            {"Valor em Json": "Valor"}
        ]

        UserModule.user.find = jest.fn().mockResolvedValue(UserMock);

        const res = mockResponse();
        const req = mockRequest();

        const UserController = new userController();
        await UserController.getAllUser(req, res);

        expect(UserModule.User.find).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(UserMock);

    });
});