using { com.mindset.quiz as my } from '../db/schema';

service QuizService {
    entity Quiz as projection on my.quiz;
    // annotate Quiz with @odata.draft.enabled;
}

// service quizservice1 {
//     entity Conditions as projection on my.quizConditions;
// }