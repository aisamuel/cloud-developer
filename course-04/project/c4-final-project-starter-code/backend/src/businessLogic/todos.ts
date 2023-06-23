import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { CreateTodoPayload } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE


export async function getTodosForUser(userId: string) {
  const result = await docClient.query({
    TableName: todosTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false
  }).promise()

  return result.Items
}


export async function createTodo(newItem: CreateTodoPayload) {
  await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise()

  return newItem
}


export async function updateTodo(todoId: any, userId: any, updatedItem: UpdateTodoRequest) {
  
  try {
    await docClient.update({
      TableName: todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
      ExpressionAttributeValues: {
        ":name": updatedItem.name,
        ":dueDate": updatedItem.dueDate,
        ":done": updatedItem.done
      },
    }).promise()

    return updatedItem
  }
  catch (err) {
    console.error(`Updating Todo:${todoId}`, err);
  }
}

