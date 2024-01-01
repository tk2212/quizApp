using { com.mindset.quiz as my } from '../db/schema';

service QuizService {
    entity Quiz as projection on my.quiz;
    entity Users as projection on my.users;
    entity Answers as projection on my.quizAnswers;
    entity Questions as projection on my.quizQuestions;
    entity Response as projection on my.userResponse;
    entity Conditions as projection on my.quizConditions; 

    // annotate Quiz with @odata.draft.enabled;
}

// service quizservice1 {
//     entity Conditions as projection on my.quizConditions;
// }