'use strict';
const AWS = require('aws-sdk');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

const dynamoDb =  new AWS.DynamoDB.DocumentClient()
const params = {
  TableName:'CLIENTE'
}

module.exports.listarClientes = async (event) => {
  try{
    let data = await dynamoDb.scan(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    }
  }catch(erro){
    return {
      statusCode: erro.statusCode ? erro.statusCode : 500,
      body: JSON.stringify(
        {
          error: erro.name ? erro.name :"Exception",
          message: erro.message ? erro.message : "Unknown error"
        }),
    };
  }  
};

module.exports.listarCliente = async (event) => {  
  try{
    const {id} = event.pathParameters;
    const data = await dynamoDb.get({
      ...params,
      Key:{
        id: id
      }
      }).promise();
      
    if(!data.Item){
      return {
        statusCode: erro.statusCode ? erro.statusCode : 404,
        body: JSON.stringify(
          {            
            error:"Cliente não encontrado"
          }),
      };
    }

    const cliente = data.Item
    return {
      statusCode: 200,
      body: JSON.stringify({cliente},null,2),
    };
  }catch(erro){
    return {
      statusCode: erro.statusCode ? erro.statusCode : 500,
      body: JSON.stringify(
        {
          error: erro.name ? erro.name :"Exception",
          message: erro.message ? erro.message : "Unknown error"
        }),
    };
  }
};

module.exports.cadastrarCliente = async (event) => {
  try{    
    let dados = JSON.parse(event.body);
    const {sobrenome, nome} = dados;
    const cliente = {
      id : uuidv4(),
      sobrenome,
      nome,
      status:true,
      data_cadastro: moment().format("YYYY-MM-DD"),
      atualizado_em: moment().format("YYYY-MM-DD")
    };

    await dynamoDb.put({
      TableName: 'CLIENTE',
      Item: cliente
    }).promise()
    return {
      statusCode: 201     
    }
  }catch(erro){
    return {
      statusCode: erro.statusCode ? erro.statusCode : 500,
      body: JSON.stringify(
        {
          error: erro.name ? erro.name :"Exception",
          message: erro.message ? erro.message : "Unknown error"
        }),
    };
  }  
};

module.exports.editarCliente = async (event) => {  
  try{
    const {id} = event.pathParameters;   
    let dados = JSON.parse(event.body); 
    const {sobrenome, nome} = dados;
    await dynamoDb.update({
      ... params,
      Key:{
        id:id
      },
      UpdateExpression:
      'SET nome = :nome, sobrenome = :sobrenome, atualizado_em = :atualizado_em',
      ConditionExpression: 'attribute_exists(id)',
      ExpressionAttributeValues:{
        ':nome':nome,
        ':sobrenome':sobrenome,
        ':atualizado_em':moment().format('YYYY-MM-DD')
      }
    }).promise()
    return {
      statusCode: 204     
    }
  }catch(erro){
    let error = erro.name ? erro.name :"Exception"
    let message =  erro.message ? erro.message : "Unknown error"

    if(erro.name = 'ConditionalCheckFailedException'){
      error = "Cliente não encontrado"    
    }
    return {
      statusCode: erro.statusCode ? 404 : 500,
      body: JSON.stringify(
        {
          error
        }),
    };
  }  
};

module.exports.excluirCliente = async (event) => {  
  try{
    const {id} = event.pathParameters;   
    await dynamoDb.delete({
      ... params,
      Key:{
        id: id
      },
      ConditionExpression: 'attribute_exists(id)'
    }).promise()
    
    return {
      statusCode: 200   
    }
  }catch(erro){
    let error = erro.name ? erro.name :"Exception"
    let message =  erro.message ? erro.message : "Unknown error"

    if(erro.name = 'ConditionalCheckFailedException'){
      error = "Cliente não encontrado"    
    }
    return {
      statusCode: erro.statusCode ? 404 : 500,
      body: JSON.stringify(
        {
          error
        }),
    };
  }  
};