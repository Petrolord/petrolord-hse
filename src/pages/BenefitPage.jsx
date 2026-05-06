import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { benefitsData } from '@/data/benefitsData';
import BenefitPageTemplate from '@/components/benefits/BenefitPageTemplate';
import { Helmet } from 'react-helmet';

export default function BenefitPage() {
  const { slug } = useParams();
  const data = benefitsData[slug];

  if (!data) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{data.title} - Petrolord HSE</title>
        <meta name="description" content={data.subtitle} />
      </Helmet>
      <BenefitPageTemplate data={data} />
    </>
  );
}