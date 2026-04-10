# pou-compliance-backend

Backend service for **POU PROTOCOLO V24** designed to expose compliance-related routes and support **Chainalysis Oracle** integration in a structured and auditable way.

## Overview

This backend currently exposes the following routes:

- `POST /api/compliance/chainalysis`
- `GET /health`

Its purpose is to provide a standardized compliance interface for **POU PROTOCOLO V24**, using **Chainalysis Oracle** as the current screening reference.

## Official Context

**POU PROTOCOLO V24** is a BNB Smart Chain protocol focused on:

- treasury protection
- controlled token issuance
- reserve-based structure
- timed claim logic
- compliance-ready architecture

## Official Network

- **Blockchain:** BNB Smart Chain
- **Chain ID:** 56

## Official Contracts

- **Official Token V24:** `0x4C42587b1DA6a121CBa48053C19A534B6C091198`
- **Official Protocol V24:** `0xe7603361925c5483C22A02D5B3DeADD0ab467f5A`

## Local Usage

1. Enter the `pou-compliance-backend` folder
2. Copy `.env.example` to `.env`
3. Run:

```bash
npm install
npm start
