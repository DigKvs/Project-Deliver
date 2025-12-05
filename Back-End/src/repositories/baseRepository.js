export class BaseRepository{
    constructor(model){
        this.model = model;
    }

    async create(data){
        return await this.model.create(data)
    }

    async findById(id){
        return await this.model.findById(id)
    }

    // implementar  o filtro (busca por nome, til, descption)
    async findAll(filter = {}){
        return await this.model.find(filter)
    }

    async update(id,data){
        return await this.model.findByIdAndUpdate(
            id,
            data,
            {new: true}   
        )
    }

    async delete(id){
        return await this.model.findByIdAndDelete(
            id
        )
    }
    async search(query){
        return await this.model.find(
            query
        )
    }
}