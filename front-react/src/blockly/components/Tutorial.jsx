import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { Alert, Button, Card, Col, Container, Row } from 'react-bootstrap';
import './Tutorial.css';

const steps = [
  {
    type: "info",
    title: "🎉 블록코딩을 시작해볼까?",
    text: "안녕! 나랑 같이 재미있는 블록 코딩을 배워보자!",
  },
  {
    type: "quiz",
    question: "이미지를 오른쪽으로 움직이려면 어떤 블록을 써야 할까?",
    options: ["말하기 블록", "이동하기 블록", "배경 바꾸기 블록"],
    answer: "이동하기 블록",
  },
  {
    type: "quiz",
    question: "고양이에게 말을 시키는 블록은?",
    options: ["회전하기", "배경 바꾸기", "말하기 블록"],
    answer: "말하기 블록",
  },
  {
    type: "quiz",
    question: "어떤 블록을 사용해서 이미지를 회전시킬 수 있을까?",
    options: ["회전하기 블록", "배경 바꾸기 블록", "이동하기 블록"],
    answer: "회전하기 블록",
  },
  {
    type: "quiz",
    question: "이미지 크기를 바꾸려면 어떤 블록을 써야 할까?",
    options: ["크기 변경 블록", "이동하기 블록", "말하기 블록"],
    answer: "크기 변경 블록",
  },
  {
    type: "quiz",
    question: "어떤 블록을 사용해서 이미지가 안 보이게 할 수 있을까?",
    options: ["숨기기 블록", "이동하기 블록", "배경 바꾸기 블록"],
    answer: "숨기기 블록",
  },
];

function Tutorial() {
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);

  const current = steps[step];

  const handleOptionClick = (option) => {
    if (option === current.answer) {
      setFeedback("🎉 정답이야! 잘했어!");
      setIsCorrect(true);
    } else {
      setFeedback("😅 아쉬워! 다시 한 번 생각해볼까?");
      setIsCorrect(false);
    }
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
    setFeedback('');
    setIsCorrect(null);
  };

  const resetTutorial = () => {
    setStep(0);
    setFeedback('');
    setIsCorrect(null);
  };

  return (
    <Container className="my-5">
      {current.type === "info" ? (
        <Card className="tutorial-card text-center shadow bg-light">
          <Card.Body>
            <Card.Title className="text-primary fs-3">{current.title}</Card.Title>
            <Card.Text className="fs-5">{current.text}</Card.Text>
            <Button variant="success" className="next-btn" onClick={nextStep}>다음 👉</Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="quiz-container shadow text-center bg-warning bg-opacity-25">
          <Card.Body>
            <Card.Title className="fs-3">🧩 퀴즈 {Math.ceil(step)}</Card.Title>
            <Card.Text className="fs-5">{current.question}</Card.Text>
            <Row className="mb-3">
              {current.options.map((opt, i) => (
                <Col key={i} xs={12} md={4} className="mb-2">
                  <Button
                    variant={isCorrect === null ? 'warning' : (opt === current.answer ? 'success' : 'secondary')}
                    className="w-100 option-btn"
                    onClick={() => handleOptionClick(opt)}
                    disabled={isCorrect !== null}
                  >
                    {opt}
                  </Button>
                </Col>
              ))}
            </Row>
            {feedback && (
              <Alert variant={isCorrect ? 'success' : 'danger'}>{feedback}</Alert>
            )}
            {(isCorrect || isCorrect === false) && step < steps.length - 1 && (
              <Button variant="info" className="next-btn" onClick={nextStep}>다음 문제 👉</Button>
            )}
            {step === steps.length - 1 && isCorrect && (
              <>
                <Alert variant="success" className="mt-3">🎉 모든 튜토리얼을 끝냈어! 정말 멋져!</Alert>
                <Button variant="success" className="next-btn" onClick={resetTutorial}>다시 시작하기 🔁</Button>
              </>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default Tutorial;