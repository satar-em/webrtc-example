package database

import (
	"errors"
	"fmt"
	"github.com/gofiber/contrib/websocket"
	log "github.com/sirupsen/logrus"
)

type User struct {
	Id               uint   `json:"id"`
	Name             string `json:"name"`
	socketConnection *websocket.Conn
}

func (user *User) SetSocketConnection(conn *websocket.Conn) {
	if user.socketConnection == nil {
		log.WithFields(log.Fields{
			"user":   fmt.Sprintf("(%s,%d)", user.Name, user.Id),
			"connId": conn.Locals("connId"),
		}).Printf("user %s coming to server\n", user.Name)
	} else {
		log.WithFields(log.Fields{
			"user":   fmt.Sprintf("(%s,%d)", user.Name, user.Id),
			"connId": conn.Locals("connId"),
		}).Printf("user %s Change soket connection\n", user.Name)
	}
	user.socketConnection = conn
}

func (user *User) EqualSocketConnection(conn *websocket.Conn) bool {
	return user.socketConnection == conn
}
func (user *User) SendMessage(message interface{}) {
	if user.socketConnection == nil {
		//log.Println("sendMessage=>socketConnection is null")
	}
	err := user.socketConnection.WriteJSON(message)
	if err != nil {
		//log.Println("user.socketConnection.WriteJSON(message)=>", err.Error())
	}
}

func (user *User) CloseConnection() {
	log.Printf("user %s leave server\n", user.Name)
	if user.socketConnection == nil {
		//log.Println("CloseConnection=>socketConnection = nil")
		return
	}
	writer, err := user.socketConnection.NextWriter(websocket.CloseMessage)
	if err != nil {
		//log.Println("user.socketConnection.NextWriter(websocket.CloseMessage)", err)
	} else {
		err = writer.Close()
		if err != nil {
			//log.Println("writer.Close()", err)
		}
	}
	user.socketConnection = nil
}

var UserIdCounter = uint(0)
var userRepository = []*User{}

func CreateUser(name string) (*User, error) {
	if name == "" || name == " " {
		return nil, errors.New("name of user cannot be empty")
	}
	UserIdCounter++
	user := &User{Id: UserIdCounter, Name: name}
	userRepository = append(userRepository, user)
	return user, nil
}

func GetAllUsers() []*User {
	return userRepository
}

func GetUserById(idUser uint) (*User, error) {
	var user *User
	for _, emUser := range userRepository {
		if emUser.Id == idUser {
			user = emUser
			break
		}
	}
	if user == nil {
		return nil, errors.New("not user found")
	}
	return user, nil
}
func DeleteUserById(idUser uint) {
	newDbUsers := []*User{}
	for _, userInDb := range userRepository {
		if userInDb.Id != idUser {
			newDbUsers = append(newDbUsers, userInDb)
		}
	}
	userRepository = newDbUsers
}
