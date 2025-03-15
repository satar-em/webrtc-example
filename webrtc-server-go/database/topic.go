package database

import (
	"errors"
	"fmt"
)

type Topic struct {
	Id          uint    `json:"id"`
	Name        string  `json:"name"`
	Subscribers []*User `json:"subscribers"`
}

func (topic *Topic) HasUser(user *User) (hasUser bool) {
	hasUser = false
	for _, u := range topic.Subscribers {
		if u.Id == user.Id {
			hasUser = true
			break
		}
	}
	return
}

var topicIdCounter = uint(0)
var topicRepository = []*Topic{}

func CreateTopic(name string) (*Topic, error) {
	if name == "" || name == " " {
		return nil, errors.New("name of topic cannot be empty")
	}
	var topic *Topic
	for _, emTopic := range topicRepository {
		if emTopic.Name == name {
			topic = emTopic
			break
		}
	}
	if topic != nil {
		return nil, fmt.Errorf("error: topic with name %s already exist", name)
	}

	topicIdCounter++
	topic = &Topic{Id: topicIdCounter, Name: name}
	topicRepository = append(topicRepository, topic)
	return topic, nil
}

func GetAllTopics() []*Topic {
	return topicRepository
}
func GetTopicById(idTopic uint) (*Topic, error) {
	var topic *Topic
	for _, emTopic := range topicRepository {
		if emTopic.Id == idTopic {
			topic = emTopic
			break
		}
	}
	if topic == nil {
		return nil, errors.New("not topic found")
	}
	return topic, nil
}

func GetTopicByName(nameTopic string) (*Topic, error) {
	var topic *Topic
	for _, emTopic := range topicRepository {
		if emTopic.Name == nameTopic {
			topic = emTopic
			break
		}
	}
	if topic == nil {
		return nil, errors.New("not topic found")
	}
	return topic, nil
}
