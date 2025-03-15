package database

import (
	"errors"
	"time"
)

type Room struct {
	Id                  uint                   `json:"id"`
	Name                string                 `json:"name"`
	Creator             *User                  `json:"creator"`
	CreatedAt           time.Time              `json:"createdAt"`
	Users               []*User                `json:"users"`
	MessageCounter      uint                   `json:"-"`
	RoomVideoConnection *[]RoomVideoConnection `json:"-"`
}

func (room *Room) HasUser(user *User) (isInRoom bool) {
	isInRoom = false
	for _, u := range room.Users {
		if u.Id == user.Id {
			isInRoom = true
			break
		}
	}
	return
}

var roomIdCounter = uint(0)
var roomRepository = []*Room{}

func CreateRoom(name string, creator *User) (*Room, error) {
	if name == "" || name == " " {
		return nil, errors.New("name of room cannot be empty")
	}
	roomIdCounter++
	room := &Room{Id: roomIdCounter, Name: name, Creator: creator, CreatedAt: time.Now(), Users: []*User{}}
	roomRepository = append(roomRepository, room)
	return room, nil
}

func GetAllRooms() []*Room {
	return roomRepository
}
func GetRoomById(idRoom uint) (*Room, error) {
	var room *Room
	for _, emRoom := range roomRepository {
		if emRoom.Id == idRoom {
			room = emRoom
			break
		}
	}
	if room == nil {
		return nil, errors.New("not topic found")
	}
	return room, nil
}
