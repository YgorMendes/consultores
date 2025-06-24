'use client';

import { useEffect, useState } from "react";
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase, ref, get, update } from "firebase/database";
import { getAnalytics, logEvent } from "firebase/analytics";
import Logo77Seguros from "../assets/seguros77";
import { Button, Form, Input } from "antd";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_apiKey,
  authDomain: process.env.NEXT_PUBLIC_authDomain,
  databaseURL: process.env.NEXT_PUBLIC_databaseURL,
  projectId: process.env.NEXT_PUBLIC_projectId,
  storageBucket: process.env.NEXT_PUBLIC_storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
  appId: process.env.NEXT_PUBLIC_appId,
  measurementId: process.env.NEXT_PUBLIC_measurementId,
};

// Inicializa o Firebase
const firebase = initializeApp(firebaseConfig);

// Obtém instâncias dos serviços
export const database = getDatabase(firebase);
export const auth = getAuth(firebase); // Se for usar Autenticação
export const storage = getStorage(firebase); // Se for usar Storage
const analytics = getAnalytics(firebase);

const Home = () => {
  const [fila, setFila] = useState<number>();
  const [consultorISVisible, setConsultorISVisible] = useState(false);
  const [form] = Form.useForm();
  const [disabled, setDisabled] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [carCode, setCarCode] = useState<string>('');

  const dataConsultores = [
    { id: 0, name: 'Wil Fernandes', description: 'Representante de Seguros Wilson Fernandes, 30 anos, trabalha no ramo de seguros a 4 anos, já ajudou a mais de mil clientes a encontrar o seguro ideal.', img: 'san.jpg', number: '11983105012', analytics: 'Will-Fernandes' },
    { id: 1, name: 'Ygor Mendes', description: 'Representante de Seguros Ygor Mendes, 27 anos, trabalha no ramo de seguros a 4 dias, não ajudou ninguém, seja o primeiro, vem pra base!!! :)', img: 'ygor.jpg', number: '11959624575', analytics: 'Ygor-Mendes' },
    { id: 2, name: 'Isac Arena', description: 'Representante de Seguros e Social Media Isac Arena, 35 anos, trabalha no ramo de seguros a 12 Anos, já ajudou a mais de mil clientes a encontrar o seguro por todo o Brasil.', img: 'isac.jpg', number: '11965618576', analytics: 'Isac-Arena' },
  ];

  function enviarWhatsApp(numero: string, mensagem = "") {
    const mensagemEncode = encodeURIComponent(mensagem);
    const url = `https://wa.me/${numero}?text=${mensagemEncode}`;

    window.open(url, "_blank"); // Abre em nova aba
  }


  const trocarConsultor = async () => {
    if (fila || fila === 0) {
      enviarWhatsApp(dataConsultores[fila]?.number, `Olá, meu nome é ${userName}

Estou interessado em um seguro para o meu veículo com placa *${carCode}*. Poderia me ajudar?`);

      logEvent(analytics, 'chat_iniciado', {
        consultor_id: dataConsultores[fila]?.analytics // Use um nome descritivo para o parâmetro
      });
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await get(ref(database, "contador"));
      console.log('Fila consultor:', snapshot.val());
      setFila(snapshot.val());
      console.log(snapshot)
      if (snapshot.val() == 2) {
        const novoContador = 0;
        await update(ref(database), { contador: novoContador });
      } else {
        const contadorSnap = await get(ref(database, "contador"));
        const contadorAtual = contadorSnap.val();
        const novoContador = contadorAtual + 1;

        await update(ref(database), { contador: novoContador });
      }
    };

    fetchData();
  }, []);

  function handleClickNext(event: any) {
    console.log(event)

    setUserName(form.getFieldValue('userName'));
    setCarCode(form.getFieldValue('carCode'));
    setConsultorISVisible(true);
  }

  function checkFormValidity() {
    const requiredFields = [
      'userName',
      'carCode'
    ];
    const hasErrors = form.getFieldsError().some(({ errors }) => errors.length > 0);
    const requiredTouched = form.isFieldsTouched(requiredFields, true);
    const allFieldsValid = !hasErrors;

    setDisabled(!(requiredTouched && allFieldsValid));
  }

  useEffect(() => {
    checkFormValidity();
  }, [])

  return (
    <div className="home-container">
      <h1 className="page-title"><Logo77Seguros style={{ transform: 'scale(1.4)', marginRight: '16px' }} /> 77 Seguros</h1>

      {
        consultorISVisible === false
          ? (
            <Form
              form={form}
              onFinish={handleClickNext}
              layout="vertical"
              className={'step1_form'}
              onFieldsChange={checkFormValidity}
            >
              <Form.Item
                name="userName"
                label="Digite seu nome"
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="carCode"
                label="Digite a placa do seu veículo"
              >
                <Input />
              </Form.Item>

              <Button
                type='primary'
                onClick={handleClickNext}
                disabled={disabled}
              >
                Conheça seu consultor agora
              </Button>
            </Form>

          )
          : (fila || fila === 0) && (
            <div className="dashboard">

              <img src={dataConsultores[fila]?.img} alt="Imagem do Consultor" />
              <h2 className="dashboard-title">{dataConsultores[fila]?.name}</h2>
              <p className="dashboard-description">{dataConsultores[fila]?.description}</p>
              <button data-consultor-id={dataConsultores[fila]?.analytics} onClick={trocarConsultor} className="talk-btn">Falar com Consultor</button>
            </div>
          )
      }
    </div>
  );
};

export default Home;
