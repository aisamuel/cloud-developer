import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { CreateTodoPayload } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import * as AWSXRay from 'aws-xray-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX

export async function getTodosForUser(userId: string) {
  const result = await docClient.query({
    TableName: todosTable,
    IndexName : todosCreatedAtIndex,
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


export async function updateTodo(todoId: string, userId: string, updatedItem: UpdateTodoRequest) {
  
  try {
    await docClient.update({
      TableName: todosTable,
      Key: {
        "todoId": todoId,
        "userId": userId
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

export async function deleteTodo(todoId: string, userId: string) {
  
  try {
    await docClient.delete({
      TableName: todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }).promise()

    return {}
  }
  catch (err) {
    console.error(`Deleting Todo:${todoId}`, err);
  }
}

export async function todoExists(todoId: string, userId: string) {
  const result = await docClient
    .get({
      TableName: todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    })
    .promise()

  console.log('Get todo: ', result)
  return !!result.Item
}

export function createAttachmentPresignedUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}